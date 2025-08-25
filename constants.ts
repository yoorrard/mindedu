import { Scenario } from './types';

export const FALLBACK_SCENARIOS: Scenario[] = [
  {
    scenario: "온라인 단체 채팅방에서 친구들이 나만 빼고 다른 주제로 신나게 이야기하고 있어요. 왠지 나만 소외되는 기분이 들어요.",
    emotions: [
      { id: "e1-1", text: "외로움", emoji: "😔" },
      { id: "e1-2", text: "서운함", emoji: "😞" },
      { id: "e1-3", text: "궁금함", emoji: "🤔" },
      { id: "e1-4", text: "아무렇지 않음", emoji: "😐" },
    ],
    responses: [
      { id: "r1-1", text: "말 없이 채팅방을 나가버린다.", isCorrect: false, feedback: "마음이 상해서 나가고 싶을 수 있어요. 하지만 그러면 친구들이 오해할 수 있으니, 내 마음을 표현하는 다른 방법은 어떨까요?" },
      { id: "r1-2", text: "대화에 참여하고 싶다는 이모티콘을 보낸다.", isCorrect: true, feedback: "좋은 방법이에요! 대화의 흐름을 방해하지 않으면서 자연스럽게 관심을 표현할 수 있어요." },
      { id: "r1-3", text: "나만 빼고 이야기하냐며 화를 낸다.", isCorrect: false, feedback: "속상한 마음은 이해하지만, 화를 내면 친구들도 당황할 거예요. 잠시 마음을 가라앉히고 이야기하는 게 좋아요." },
    ],
  },
  {
    scenario: "친구가 내가 열심히 만든 발표 자료를 보고 '이것보다 더 잘 만들 수 있었을 텐데'라고 말했어요.",
    emotions: [
      { id: "e2-1", text: "속상함", emoji: "😢" },
      { id: "e2-2", text: "화남", emoji: "😠" },
      { id: "e2-3", text: "부끄러움", emoji: "😳" },
      { id: "e2-4", text: "의욕 상실", emoji: "😩" },
    ],
    responses: [
      { id: "r2-1", text: "'너는 얼마나 잘했는지 보자'며 비꼰다.", isCorrect: false, feedback: "마음이 상해서 똑같이 쏘아붙이고 싶을 수 있어요. 하지만 잠시 감정을 가라앉히고 이야기하면 더 좋은 결과를 만들 수 있답니다." },
      { id: "r2-2", text: "아무 말도 못 하고 자리를 피한다.", isCorrect: false, feedback: "속상한 마음을 표현하지 않으면 친구는 자신의 말이 어떻게 들렸는지 알 수 없어요. 용기를 내어보는 건 어떨까요?" },
      { id: "r2-3", text: "내 기분이 속상하다고 솔직하게 말한다.", isCorrect: true, feedback: "좋은 방법이에요! 자신의 감정을 솔직하고 차분하게 전달하는 것은 관계를 건강하게 만드는 중요한 첫걸음이에요." },
    ],
  },
  {
    scenario: "체육 시간에 팀을 나누어 경기를 하는데, 내가 실수해서 우리 팀이 졌어요. 팀원 몇몇이 나를 탓하는 눈치예요.",
    emotions: [
      { id: "e3-1", text: "미안함", emoji: "😥" },
      { id: "e3-2", text: "억울함", emoji: "😤" },
      { id: "e3-3", text: "슬픔", emoji: "😭" },
      { id: "e3-4", text: "창피함", emoji: "😳" },
    ],
    responses: [
      { id: "r3-1", text: "팀원들에게 먼저 미안하다고 사과한다.", isCorrect: true, feedback: "훌륭한 태도예요! 자신의 실수를 인정하고 먼저 사과하는 모습은 정말 멋지고 팀을 더 단단하게 만들어요." },
      { id: "r3-2", text: "나 때문이 아니라고 다른 사람 탓을 한다.", isCorrect: false, feedback: "다른 사람 탓을 하면 팀워크가 깨지고 갈등이 더 커질 수 있어요. 먼저 책임지는 모습을 보여주는 게 중요해요." },
      { id: "r3-3", text: "아무 말 없이 혼자 멀리 가 있는다.", isCorrect: false, feedback: "속상해서 혼자 있고 싶을 수 있지만, 그러면 팀원들과 오해가 풀리지 않아요. 함께 이야기하는 용기가 필요해요." },
    ],
  },
];
