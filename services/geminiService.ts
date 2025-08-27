import { Type } from "@google/genai";
import { Scenario, UserAnswer } from '../types';
import { FALLBACK_SCENARIOS } from '../constants';

// Helper function to call our secure API endpoint
async function callApi(action: string, payload: object): Promise<any> {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, payload }),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.error || 'API request failed');
        }

        const data = await response.json();
        // The serverless function returns { text: ... },
        // so we extract the text property here.
        return data.text;
    } catch (error) {
        console.error(`API call failed for action "${action}":`, error);
        throw error;
    }
}

// Schemas are still needed on the client to construct the request payload
const singleScenarioSchema = {
    type: Type.OBJECT,
    properties: {
      scenario: {
        type: Type.STRING,
        description: "초등 고학년 학생이 학교 생활(온라인 포함)에서 겪을 수 있는 현실적이고 약간 복잡한 갈등 상황에 대한 한두 문장의 설명입니다."
      },
      emotions: {
        type: Type.ARRAY,
        description: "그 상황에서 느낄 수 있는 네 가지 다양한 감정입니다.",
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: "감정의 고유 ID (예: 'emotion1')" },
            text: { type: Type.STRING, description: "감정의 이름 (예: '속상함')" },
            emoji: { type: Type.STRING, description: "감정을 나타내는 이모지 (예: '😢')" },
          },
          required: ["id", "text", "emoji"]
        }
      },
      responses: {
        type: Type.ARRAY,
        description: "상황에 대한 세 가지 가능한 대응 방안입니다.",
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: "대응 방안의 고유 ID (예: 'response1')" },
            text: { type: Type.STRING, description: "대응 방안에 대한 설명입니다. 다른 선택지들과 비슷한 길이로 간결하게 작성해주세요." },
            isCorrect: { type: Type.BOOLEAN, description: "이 대응이 권장되는 행동인지 여부입니다." },
            feedback: { type: Type.STRING, description: "이 대응을 선택했을 때 제공될 구체적이고 건설적인 피드백 메시지입니다. **절대 마크다운을 사용하지 말고**, 평이한 텍스트로 2-3문장 내로 간결하게 작성해주세요. 잘못된 선택지인 경우, 왜 좋지 않은지 설명하고 더 나은 대안을 부드럽게 제시해주세요." },
          },
          required: ["id", "text", "isCorrect", "feedback"]
        }
      }
    },
    required: ["scenario", "emotions", "responses"]
  };

export const generateScenarios = async (count: number): Promise<Scenario[]> => {
    try {
        const payload = {
            model: "gemini-2.5-flash",
            contents: `초등 고학년 인성 교육을 위한 학교 내 갈등 상황 시뮬레이션 시나리오 ${count}개를 생성해줘. 온라인 소통, 조별 과제, 친구 관계, 경쟁 등 현실적이고 약간 복잡한 상황으로 부탁해. 각 시나리오는 서로 다른 주제를 다루어야 해. 다음 JSON 스키마를 따라야 해.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: singleScenarioSchema },
                temperature: 1.0,
            },
        };
        let jsonString = await callApi('generateScenarios', payload);

        if (typeof jsonString !== 'string') {
            throw new Error("API returned a non-string response for scenarios.");
        }

        // Clean up potential markdown code block fences
        const jsonMatch = jsonString.match(/```(json)?([\s\S]*?)```/);
        if (jsonMatch && jsonMatch[2]) {
            jsonString = jsonMatch[2];
        }
        
        const generatedData = JSON.parse(jsonString.trim());
        
        if (!Array.isArray(generatedData) || generatedData.length === 0) {
            throw new Error("Generated data is not a valid array of scenarios.");
        }
        return generatedData as Scenario[];
    } catch (error) {
        console.error("Error generating scenarios via API, using fallback.", error);
        // On failure, return fallback scenarios as a reliable alternative
        return Promise.resolve(FALLBACK_SCENARIOS.slice(0, count));
    }
};

export const provideFeedbackOnResponse = async (scenario: string, userResponse: string): Promise<string> => {
    try {
        const payload = {
            model: "gemini-2.5-flash",
            contents: `당신은 초등학생을 위한 친절하고 현명한 상담가입니다. 학생이 처한 상황은 다음과 같습니다: "${scenario}". 이 상황에서 학생은 이렇게 말하고 싶어합니다: "${userResponse}". 학생의 답변을 분석하고, 부드럽고 격려하는 말투로 피드백을 한국어로 작성해주세요. **절대 마크다운 문법(예: **, *)을 사용하지 마세요.** 평이한 텍스트로 2-3개의 문장으로 간결하게 작성해야 합니다. 만약 학생의 답변이 무성의하거나(예: '몰라요', '싫어'), 부정적이거나 공격적이라면, 왜 그런 마음이 들었을지 공감해주면서도, 단순히 공감만 하는 것을 넘어 학생이 더 나은 방향으로 생각하고 말할 수 있도록 구체적인 대안이나 질문을 던져주며 긍정적인 변화를 유도해주세요.`,
            config: { temperature: 0.5 }
        };
        const feedback = await callApi('provideFeedback', payload);
        return feedback.replace(/[\*\_#]/g, '');
    } catch (error) {
        console.error("Error getting feedback:", error);
        return "피드백을 생성하는 중 오류가 발생했어요. 다시 시도해 주세요.";
    }
};

export const generateMindGrowthReport = async (answers: UserAnswer[]): Promise<string> => {
    try {
        const userAnswersString = JSON.stringify(answers, null, 2);
        const payload = {
            model: "gemini-2.5-flash",
            contents: `당신은 아이들의 마음을 잘 이해하는 전문 심리 상담가입니다. 한 초등학생이 가상 시뮬레이션을 통해 여러 갈등 상황에 다음과 같이 응답했습니다: ${userAnswersString}. 
            이 응답들을 바탕으로, 학생을 위한 매우 개인화되고 깊이 있는 '마음 성장 리포트'를 마크다운 형식의 한국어로 작성해주세요. 
            리포트는 단순한 칭찬을 넘어, 학생의 실제 답변(선택한 감정, 행동, 작성한 말)을 구체적으로 언급하며 분석해야 합니다. 예를 들어, "A상황에서 '속상함'을 느끼고 '솔직하게 말한다'고 답한 것을 보니, 자신의 감정을 건강하게 표현할 줄 아는군요." 와 같이 작성해주세요. 답변들의 패턴을 분석하여 학생의 강점과 성장할 수 있는 점을 통찰력 있게 짚어주세요.
            개선점은 비판이 아닌, "다음에는 이렇게 해보면 어떨까요?"와 같이 부드럽고 실천 가능한 대안을 제시하여 긍정적인 변화를 유도해야 합니다. 'OO아' 와 같이 학생의 이름을 부르는 표현은 절대 사용하지 마세요. 익명성을 유지해주세요.

            리포트 구성 (각 섹션은 3-4문장 내외로 간결하게 작성):
            1. 제목: '# 마음 성장 리포트 쑥쑥 🌱'
            2. 감정 분석: '## 감정 탐험하기 🎨' 제목으로, 학생이 선택한 감정들을 통해 자신의 감정을 얼마나 잘 이해하고 있는지 분석하고 격려.
            3. 행동 및 언어 분석: '## 생각과 행동의 힘 💪' 제목으로, 학생의 문제 해결 방식과 작성한 대화 내용을 분석. 긍정적인 점은 칭찬하고, 개선할 점이 보이면 "이렇게 해보면 어떨까요?" 와 같이 부드럽게 제안.
            4. 성장을 위한 제안: '## 성장을 위한 제안 ✨' 제목으로, 앞으로 친구들과 더 즐겁게 소통할 수 있는 구체적이고 긍정적인 팁을 1~2가지 제안하며 용기를 주는 따뜻한 마무리.
            `,
            config: { temperature: 0.6 }
        };
        return await callApi('generateReport', payload);
    } catch (error) {
        console.error("Error generating report:", error);
        return "리포트를 생성하는 중 오류가 발생했어요. 다시 시도해 주세요.";
    }
};

export const saveReportToSheet = async (answers: UserAnswer[], report: string): Promise<void> => {
    try {
        const response = await fetch('/api/saveToSheet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userAnswers: answers, mindGrowthReport: report }),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.error || 'Failed to save report to sheet');
        }
        console.log("Report successfully saved to Google Sheet.");
    } catch (error) {
        // Log the error but don't re-throw, as failing to save shouldn't block the user from seeing their report.
        console.error("Could not save report to Google Sheet:", error);
    }
};