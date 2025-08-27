import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Scenario, Emotion, Response, UserAnswer } from './types';
import { generateScenarios, provideFeedbackOnResponse, generateMindGrowthReport, saveReportToSheet } from './services/geminiService';
import { FALLBACK_SCENARIOS } from './constants';
import { CheckIcon, CrossIcon, PencilIcon, HeartIcon, LightbulbIcon, BrainIcon, LoadingSpinnerIcon } from './components/icons';

const TOTAL_SCENARIOS = 3;

// --- Helper Components ---
interface OptionButtonProps {
    text: string;
    emoji?: string;
    onClick: () => void;
    isSelected: boolean;
    isCorrect?: boolean;
    showResult: boolean;
    disabled?: boolean;
}

const OptionButton: React.FC<OptionButtonProps> = ({ text, emoji, onClick, isSelected, isCorrect, showResult, disabled }) => {
    const baseClasses = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ease-in-out flex items-center text-lg md:text-xl shadow-sm disabled:opacity-60 disabled:cursor-not-allowed";
    const hoverClasses = "hover:shadow-md hover:scale-105";
    const selectedClasses = "ring-4 ring-blue-400 scale-105 shadow-lg bg-blue-50 border-blue-400";
    
    let resultClasses = "";
    if (showResult && isSelected) {
        resultClasses = isCorrect ? "bg-green-100 border-green-500 text-green-800" : "bg-red-100 border-red-500 text-red-800";
    } else if (showResult && isCorrect) {
        resultClasses = "bg-green-100 border-green-500 text-green-800";
    } else {
        resultClasses = "bg-white border-gray-200";
    }
    
    return (
        <button
            onClick={onClick}
            disabled={disabled || showResult}
            className={`${baseClasses} ${isSelected ? selectedClasses : hoverClasses} ${resultClasses}`}
        >
            {emoji && <span className="text-3xl mr-4">{emoji}</span>}
            <span className="flex-1">{text}</span>
        </button>
    );
};

interface ReportSectionProps {
    icon: React.ReactNode;
    title: string;
    content: string;
}

const ReportSection: React.FC<ReportSectionProps> = ({ icon, title, content }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
        <div className="flex items-center mb-3">
            {icon}
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        </div>
        <p className="text-gray-600 text-lg leading-relaxed">{content}</p>
    </div>
);


// --- Main App Component ---
const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(GameState.LOADING);
    const [scenarios, setScenarios] = useState<Scenario[]>([]);
    const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
    const [currentStep, setCurrentStep] = useState<'emotion' | 'response' | 'write'>('emotion');
    
    const [selectedEmotionIds, setSelectedEmotionIds] = useState<string[]>([]);
    const [selectedResponseId, setSelectedResponseId] = useState<string | null>(null);
    const [writtenResponse, setWrittenResponse] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
    const [mindGrowthReport, setMindGrowthReport] = useState<string | null>(null);
    
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState<string>("");
    const [isChoiceCorrect, setIsChoiceCorrect] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const loadScenarios = useCallback(async () => {
        setApiError(null);
        setGameState(GameState.LOADING);
        try {
            const newScenarios = await generateScenarios(TOTAL_SCENARIOS);
            setScenarios(newScenarios);
        } catch (error) {
            console.error(error);
            setScenarios(FALLBACK_SCENARIOS.slice(0, TOTAL_SCENARIOS));
            setApiError("새로운 이야기들을 만드는데 실패해서, 준비된 이야기들로 시작할게요!");
        } finally {
            setGameState(GameState.WELCOME);
        }
    }, []);

    useEffect(() => {
        loadScenarios();
    }, [loadScenarios]);

    const resetForNextScenario = () => {
        setShowFeedback(false);
        setSelectedEmotionIds([]);
        setSelectedResponseId(null);
        setWrittenResponse("");
        setCurrentStep('emotion');
        setFeedbackMessage("");
        setIsChoiceCorrect(false);
        setApiError(null);
    };

    const handleRestart = () => {
        setCurrentScenarioIndex(0);
        setScenarios([]);
        resetForNextScenario();
        setUserAnswers([]);
        setMindGrowthReport(null);
        loadScenarios();
    };

    const handleSelectEmotion = (emotionId: string) => {
        setSelectedEmotionIds(prev => 
            prev.includes(emotionId) ? prev.filter(id => id !== emotionId) : [...prev, emotionId]
        );
    };

    const confirmEmotions = () => {
        if (selectedEmotionIds.length === 0) return;
        setFeedbackMessage("그런 감정들을 느낄 수 있구나. 네 마음을 알려줘서 고마워!");
        setIsChoiceCorrect(true); // Always positive for emotions
        setShowFeedback(true);
    };

    const handleSelectResponse = (response: Response) => {
        setSelectedResponseId(response.id);
        setIsChoiceCorrect(response.isCorrect);
        setFeedbackMessage(response.feedback);
        setShowFeedback(true);
    };
    
    const handleFeedbackNext = () => {
        setShowFeedback(false);
        if (currentStep === 'emotion') {
            setCurrentStep('response');
        } else if (currentStep === 'response') {
            setCurrentStep('write');
        }
    };

    const handleWrittenResponseSubmit = async () => {
        if (!writtenResponse.trim()) return;
        setIsSubmitting(true);
        setFeedbackMessage("");
        
        const currentScenario = scenarios[currentScenarioIndex];
        const feedback = await provideFeedbackOnResponse(currentScenario.scenario, writtenResponse);
        setFeedbackMessage(feedback);
        setIsChoiceCorrect(true);
        setShowFeedback(true);
        setIsSubmitting(false);

        // Save the answer
        const selectedEmotions = currentScenario.emotions.filter(e => selectedEmotionIds.includes(e.id));
        const selectedResponse = currentScenario.responses.find(r => r.id === selectedResponseId);

        const newAnswer = {
            scenario: currentScenario.scenario,
            selectedEmotionTexts: selectedEmotions.map(e => e.text),
            selectedResponseText: selectedResponse?.text || "",
            writtenResponse: writtenResponse,
        };
        
        // This is the last step for the scenario, so we add it to userAnswers
        // We ensure we only add answers once, right at the end of a scenario.
        setUserAnswers(prev => [...prev, newAnswer]);
    };

    const handleNext = () => {
        setShowFeedback(false);

        if (currentScenarioIndex >= TOTAL_SCENARIOS - 1) {
            setGameState(GameState.GENERATING_REPORT);
            const generateReport = async () => {
                // Ensure the last answer is captured before generating the report
                const finalAnswers = userAnswers;
                // Note: handleWrittenResponseSubmit already saves the answer, 
                // so we use the state directly.
                
                try {
                    const report = await generateMindGrowthReport(finalAnswers);
                    setMindGrowthReport(report);
                    
                    // Save the results to Google Sheets in the background.
                    // This is non-blocking for the user.
                    if (report) {
                       await saveReportToSheet(finalAnswers, report);
                    }
                } catch (error) {
                    console.error("Failed to generate report:", error);
                    setApiError("리포트를 생성하는 데 문제가 발생했어요.");
                } finally {
                    setGameState(GameState.FINISHED);
                }
            };
            generateReport();
            return;
        }

        resetForNextScenario();
        setCurrentScenarioIndex(prev => prev + 1);
    };
    
    const parseReport = (reportText: string | null) => {
        if (!reportText) return {};
        const sections = reportText.split('## ').slice(1);
        const reportData: { [key: string]: string } = {};
        sections.forEach(section => {
            const [title, ...content] = section.split('\n');
            reportData[title.trim()] = content.join('\n').trim();
        });
        return reportData;
    };

    const currentScenario = scenarios[currentScenarioIndex];

    const renderContent = () => {
        switch (gameState) {
            case GameState.LOADING:
                return (
                    <div className="text-center">
                        <h1 className="text-3xl font-bold mb-4">마음 성장 교실</h1>
                        <p className="text-xl">AI 선생님이 여러분을 위한 특별한 이야기들을 만들고 있어요. 잠시만 기다려주세요!</p>
                        <div className="w-20 h-20 mx-auto mt-8">
                            <div className="w-full h-full animate-spin">
                                <LoadingSpinnerIcon className="text-yellow-500" />
                            </div>
                        </div>
                    </div>
                );

            case GameState.WELCOME:
                return (
                    <div className="text-center">
                         {apiError && <p className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4" role="alert">{apiError}</p>}
                        <h1 className="text-5xl font-bold mb-4 text-gray-800">마음 성장 교실에 온 걸 환영해요!</h1>
                        <p className="text-xl text-gray-600 mb-8">학교에서 일어나는 여러 가지 상황들을 만나고<br/>어떻게 행동하면 좋을지 함께 배워봐요.</p>
                        <button onClick={() => setGameState(GameState.PLAYING)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 px-10 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300">
                            시작하기!
                        </button>
                    </div>
                );
            
            case GameState.GENERATING_REPORT:
                 return (
                    <div className="text-center p-8 sm:p-12 bg-white rounded-2xl shadow-2xl max-w-lg mx-auto">
                        <div className="w-24 h-24 mx-auto mb-6">
                           <div className="w-full h-full animate-spin">
                             <LoadingSpinnerIcon className="text-yellow-400" />
                           </div>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">마음 성장 리포트 작성 중...</h1>
                        <p className="text-lg text-gray-600">
                            AI 선생님이 여러분의 멋진 답변들을 모아<br/>
                            특별한 리포트를 만들고 있어요!
                        </p>
                    </div>
                );

            case GameState.FINISHED:
                const reportData = parseReport(mindGrowthReport);
                return (
                    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4">
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl shadow-2xl text-center">
                            {apiError && <p className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4" role="alert">{apiError}</p>}
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">마음 성장 리포트 쑥쑥 🌱</h1>

                            {reportData['감정 탐험하기 🎨'] && <ReportSection icon={<HeartIcon className="w-8 h-8 text-red-500 mr-3" />} title="감정 탐험하기" content={reportData['감정 탐험하기 🎨']} />}
                            {reportData['생각과 행동의 힘 💪'] && <ReportSection icon={<BrainIcon className="w-8 h-8 text-blue-500 mr-3" />} title="생각과 행동의 힘" content={reportData['생각과 행동의 힘 💪']} />}
                            {reportData['성장을 위한 제안 ✨'] && <ReportSection icon={<LightbulbIcon className="w-8 h-8 text-green-500 mr-3" />} title="성장을 위한 제안" content={reportData['성장을 위한 제안 ✨']} />}

                            <button onClick={handleRestart} className="mt-8 bg-green-500 hover:bg-green-600 text-white font-bold text-xl py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300">
                                새로운 이야기로 다시하기
                            </button>
                        </div>
                    </div>
                );

            case GameState.PLAYING:
                if (!currentScenario) return null;
                return (
                    <div className="w-full max-w-4xl mx-auto">
                        <div className="mb-8">
                            <div className="h-4 bg-gray-200 rounded-full">
                                <div className="h-4 bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${((currentScenarioIndex + 1) / TOTAL_SCENARIOS) * 100}%` }}></div>
                            </div>
                            <p className="text-right mt-1 text-sm font-semibold text-gray-600">{currentScenarioIndex + 1} / {TOTAL_SCENARIOS}</p>
                        </div>
                        
                         {apiError && <p className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4" role="alert">{apiError}</p>}
                        
                        <div className="bg-white p-8 rounded-2xl shadow-xl mb-8 border-2 border-gray-100">
                            <p className="text-gray-500 font-semibold mb-2 text-lg">상황 {currentScenarioIndex + 1}</p>
                            <p className="text-2xl md:text-3xl leading-relaxed font-semibold text-gray-800">{currentScenario.scenario}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {currentStep === 'emotion' && (
                                <>
                                    <h2 className="text-xl font-bold text-center text-gray-700 mb-2">이럴 땐 어떤 기분이 들까요? (여러 개 선택 가능)</h2>
                                    {currentScenario.emotions.map(emotion => (
                                        <OptionButton
                                            key={emotion.id}
                                            text={emotion.text}
                                            emoji={emotion.emoji}
                                            onClick={() => handleSelectEmotion(emotion.id)}
                                            isSelected={selectedEmotionIds.includes(emotion.id)}
                                            showResult={false}
                                        />
                                    ))}
                                    <button onClick={confirmEmotions} disabled={selectedEmotionIds.length === 0} className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl py-3 px-6 rounded-full shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                                        선택 완료
                                    </button>
                                </>
                            )}
                            {currentStep === 'response' && (
                                <>
                                    <h2 className="text-xl font-bold text-center text-gray-700 mb-2">어떻게 행동하는 것이 좋을까요?</h2>
                                    {currentScenario.responses.map(response => (
                                        <OptionButton
                                            key={response.id}
                                            text={response.text}
                                            onClick={() => handleSelectResponse(response)}
                                            isSelected={selectedResponseId === response.id}
                                            isCorrect={response.isCorrect}
                                            showResult={showFeedback && selectedResponseId !== null}
                                        />
                                    ))}
                                </>
                            )}
                            {currentStep === 'write' && !showFeedback && (
                                <>
                                    <h2 className="text-xl font-bold text-center text-gray-700 mb-2">어떤 말을 하면 좋을까요?</h2>
                                    <textarea
                                        className="w-full p-4 border-2 border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                                        rows={4}
                                        placeholder="여러분의 솔직한 생각을 적어보세요..."
                                        value={writtenResponse}
                                        onChange={(e) => setWrittenResponse(e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                    <button onClick={handleWrittenResponseSubmit} disabled={!writtenResponse.trim() || isSubmitting} className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white font-bold text-xl py-3 px-6 rounded-full shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center">
                                        {isSubmitting ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : <>AI 선생님께 피드백 받기 <PencilIcon className="w-6 h-6 ml-2" /></>}
                                    </button>
                                </>
                            )}
                        </div>
                        
                        {showFeedback && feedbackMessage && (
                            <div className={`fixed inset-x-0 bottom-0 p-4 sm:p-6 transition-transform duration-500 transform ${showFeedback ? 'translate-y-0' : 'translate-y-full'}`}>
                                <div className={`max-w-4xl mx-auto p-6 rounded-2xl shadow-2xl flex items-start sm:items-center space-x-4 ${isChoiceCorrect ? 'bg-blue-500' : 'bg-red-500'} text-white`}>
                                    <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center ${isChoiceCorrect ? 'bg-white' : 'bg-white'}`}>
                                        {isChoiceCorrect ? <CheckIcon className="w-8 h-8 text-blue-500" /> : <CrossIcon className="w-8 h-8 text-red-500" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-lg sm:text-xl">{feedbackMessage}</p>
                                    </div>
                                    {(currentStep === 'emotion' || currentStep === 'response') && (
                                         <button onClick={handleFeedbackNext} className="self-center bg-white text-black font-bold py-2 px-6 rounded-full hover:bg-gray-200 transition-colors">
                                             다음으로
                                         </button>
                                    )}
                                    {currentStep === 'write' && !isSubmitting && (
                                         <button onClick={handleNext} className="self-center bg-white text-black font-bold py-2 px-6 rounded-full hover:bg-gray-200 transition-colors">
                                             {currentScenarioIndex === TOTAL_SCENARIOS - 1 ? '리포트 보기' : '다음으로'}
                                         </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );

            default: return null;
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-100 to-yellow-100 flex items-center justify-center p-4">
            {renderContent()}
        </main>
    );
};

export default App;