import {
  TypedUseSelectorHook,
  useDispatch as useOriginalDispatch,
  useSelector as useOriginalSelector,
} from 'react-redux'
import { save, load } from 'redux-localstorage-simple'
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit'
import undoable from 'redux-undo'
import { playCorrect, playFinish, playWrong } from './Audio'
import { NUM_DYNAMIC_OPTIONS, NUM_FINALE_OPTIONS, NUM_OPTIONS } from './defaults'


export type Attachment =
| {type: 'text', text: string}
| {type: 'img', url: string}

export type BonusOption = {
  score: number
  attachments: Attachment[]
}

export type Option = {
  value: string
  score: number
  attachments: Attachment[]
  bonus?: BonusOption
}

export type OrdinaryQuestion = {
  name: QuestionName.social | QuestionName.objective
  value: string
  options: Option[]
}

export type DynamicQuestion = {
  name: QuestionName.dynamic
  value: string
  value2: string
}

export type Question = OrdinaryQuestion | DynamicQuestion

export enum QuestionName {
  social = 'Народный раунд',
  objective = 'Раунд по фактам',
  dynamic = 'Вспомни всё',
}


const questionsSlice = createSlice({
  name: 'questions',
  initialState: [] as Question[],
  reducers: {
    addQuestion(state, action: PayloadAction<Question>) {
      state.push(action.payload)
    },
    removeQuestion(state, action: PayloadAction<number>) {
      state.splice(action.payload, 1)
    },
    editQuestion(state, action: PayloadAction<{index: number, newQuestion: Question}>) {
      state[action.payload.index] = action.payload.newQuestion
    },
  }
})

export const {
  addQuestion, removeQuestion, editQuestion,
} = questionsSlice.actions

type FinaleQuestion = {
  value: string
}

type Finale = {
  questions: FinaleQuestion[]
}

const finaleSlice = createSlice({
  name: 'finale',
  initialState: null as null | Finale,
  reducers: {
    setFinale(_, action: PayloadAction<Finale>) {
      return action.payload
    },
    deleteFinale(_) {
      return null
    }
  }
})

export const { setFinale, deleteFinale } = finaleSlice.actions

type EditorMode =
| {mode: 'view'}
| {mode: 'edit', index: number}
| {mode: 'add'}
| {mode: 'addFinale'}
| {mode: 'editFinale'}

const editorSlice = createSlice({
  name: 'editor',
  initialState: {mode: 'view'} as EditorMode,
  reducers: {
    startEditing(_, action: PayloadAction<number>) {
      return {mode: 'edit', index: action.payload}
    },
    finishEditing(_) {
      return {mode: 'view'}
    },
    startAdding(_) {
      return {mode: 'add'}
    },
    startAddingFinale(_) {
      return {mode: 'addFinale'}
    },
    startEditingFinale(_) {
      return {mode: 'editFinale'}
    },
  }
})

export const {
  startEditing, finishEditing, startAdding,
  startAddingFinale, startEditingFinale
} = editorSlice.actions

export type Team = 'leftTeam' | 'rightTeam'

const GAME_INITIAL_STATE = {
  active: false,
  currentQuestion: -1,
  finale: false,
  questionShown: false,
  subtotalShown: false,
  currentAttachments: null as null | {
    optionIndex: number
    bonus?: boolean
    secondGroup?: boolean
    teamIndex?: number
  },
  roundFinished: false,
  leftTeam: {
    cumulativeScore: 0,
    wins: 0,
    score: 0,
    health: 3,
  },
  rightTeam: {
    cumulativeScore: 0,
    wins: 0,
    score: 0,
    health: 3,
  },
  currentTeam: null as null | Team,
  q: null as null | OrdinaryState | DynamicState | FinaleState,
}
type GameState = typeof GAME_INITIAL_STATE

function makeDefaultOrdinaryOptions(question: OrdinaryQuestion) {
  return Array(NUM_OPTIONS).fill(null).map((_, i) => ({
    opened: false,
    bonus: question.options[i].bonus == null ? null : {
      opened: false,
      vacantFor: {leftTeam: true, rightTeam: true}
    }
  }))
}

function makeOrdinaryState(question: OrdinaryQuestion) {
  return {
    type: 'ordinary' as 'ordinary',
    options: makeDefaultOrdinaryOptions(question),
    drawFinished: false,
    bidScore: null as null | number,
    bonusChance: null as null | {
      optionPayload: {best?: boolean, score: number},
      optionIndex: number
    },
    healthChance: null as null | Team,
  }
}
export type OrdinaryState = ReturnType<typeof makeOrdinaryState>

function makeDynamicState() {
  return {
    type: 'dynamic' as 'dynamic',
    options: makeDynamicOptions(),
    options2: makeDynamicOptions(),
    editing: true,
    showSecond: false,
  }
}
export type DynamicState = ReturnType<typeof makeDynamicState>

function makeDynamicOptions() {
  return Array(NUM_DYNAMIC_OPTIONS).fill(null).map(_ => ({
    value: '',
    attachments: [] as Attachment[],
    score: 5,
    opened: false,
    wrong: false,
  }))
}

function makeFinaleState() {
  return {
    type: 'finale' as 'finale',
    teamsOrder: ['leftTeam', 'rightTeam'] as Team[],
    options: [
      makeFinaleOptions(),
      makeFinaleOptions(),
    ],
    names: [['', '', ''], ['', '', '']],
    openedQuestions: [false, false, false, false, false],
    optionsDone: [false, false],
    teamsFinished: [false, false],
  }
}
export type FinaleState = ReturnType<typeof makeFinaleState>

function makeFinaleOptions() {
  return Array(NUM_FINALE_OPTIONS).fill(0).map(_ => ({
    value: '',
    score: 0,
    attachments: [] as Attachment[],
    opened: false,
    scoreOpened: false,
  }))
}

function theOtherTeam(team: Team): Team {
  return team === 'leftTeam' ? 'rightTeam' : 'leftTeam'
}

const gameSlice = createSlice({
  name: 'game',
  initialState: GAME_INITIAL_STATE,
  reducers: {
    startGame(state) {
      state.active = true
    },
    finishGame(_) {
      return GAME_INITIAL_STATE
    },
    nextQuestion(state, action: PayloadAction<Question | undefined>) {
      state.currentQuestion++
      state.questionShown = false
      state.subtotalShown = false
      state.leftTeam.health = state.rightTeam.health = 3
      state.leftTeam.score = state.rightTeam.score = 0
      state.currentAttachments = null
      state.q = action.payload != null ? (
        action.payload.name !== QuestionName.dynamic ? (
          makeOrdinaryState(action.payload)
        ) : (
          makeDynamicState()
        )
      ) : makeFinaleState()
    },
    chooseTeam(state, action: PayloadAction<Team>) {
      state.currentTeam = action.payload
    },
    correctAnswer(state, action: PayloadAction<CorrectAnswerPayload>) {
      applyCorrectAnswer(state, action.payload)
    },
    correctBonus(state, action: PayloadAction<{
      index: number,
      score: number,
      attachments: Attachment[],
    }>) {
      if (state.q?.type !== 'ordinary') return
      const bonus = state.q.options[action.payload.index].bonus
      if (bonus != null) bonus.opened = true
      state.currentAttachments = {optionIndex: action.payload.index, bonus: true}
      if (state.currentTeam != null) {
        state[state.currentTeam].score += action.payload.score
        if (state.q.drawFinished) {
          switchTeamIfPossible(state)
        } else if (state.q.bonusChance != null) {
          decideOnDraw(state, state.q.bonusChance.optionPayload)
        }
      }
      state.q.bonusChance = null
      decideIfRoundFinished(state)
      playCorrect()
    },
    wrongAnswer(state) {
      switch (state.q?.type) {
      case 'ordinary':
        if (state.currentTeam == null) return
        if (!state.q.drawFinished) {
          state.currentTeam = theOtherTeam(state.currentTeam)
          if (state.q.bidScore == null) {
            state.q.bidScore = 0
          } else if (state.q.bidScore === 0) {
            state.q.bidScore = null
          } else {
            state.q.drawFinished = true
            state.q.bidScore = null
          }
        } else {
          state[state.currentTeam].health--
          if (state[state.currentTeam].health === 0) {
            state.q.healthChance = state.currentTeam
          } else {
            switchTeamIfPossible(state)
          }
        }
        break
      case 'dynamic':
        decideIfRoundFinished(state)
        if (state.roundFinished) {
          state.currentTeam = null
        }
        switchTeamIfPossible(state)
        break
      default:
        return
      }
      playWrong()
    },
    wrongBonus(state, action: PayloadAction<number>) {
      if (state.currentTeam == null) return
      if (state.q?.type !== 'ordinary') return
      const optionIndex = action.payload
      const bonus = state.q.options[optionIndex].bonus
      if (bonus != null) {
        bonus.vacantFor[state.currentTeam] = false
        if (!bonus.vacantFor.leftTeam && !bonus.vacantFor.rightTeam) {
          state.currentAttachments = {optionIndex, bonus: true}
        }
      }
      switchTeamIfPossible(state)
      decideIfRoundFinished(state)
      playWrong()
    },
    utilizeHealthChance(state) {
      if (state.q?.type !== 'ordinary') return
      if (state.q.healthChance == null) return
      state[state.q.healthChance].health++
      state.q.healthChance = null
      switchTeamIfPossible(state)
      playCorrect()
    },
    discardHealthChance(state) {
      if (state.q?.type !== 'ordinary') return
      state.q.healthChance = null
      switchTeamIfPossible(state)
      decideIfRoundFinished(state)
    },
    discardBonusChance(state) {
      if (state.q?.type !== 'ordinary') return
      if (state.q.bonusChance == null || state.currentTeam == null) return
      const bonus = state.q.options[state.q.bonusChance.optionIndex].bonus
      if (bonus != null) bonus.vacantFor[state.currentTeam] = false
      if (state.q.drawFinished) {
        switchTeamIfPossible(state)
      } else if (state.q.bonusChance != null) {
        decideOnDraw(state, state.q.bonusChance.optionPayload)
      }
      state.q.bonusChance = null
      decideIfRoundFinished(state)
      playWrong()
    },
    deltaScore(state, action: PayloadAction<{team: Team, value: number}>) {
      state[action.payload.team].score += action.payload.value
    },
    plusHealth(state, action: PayloadAction<Team>) {
      if (state[action.payload].health < 3) {
        state[action.payload].health += 1
      }
    },

    setOptions(state, action: PayloadAction<{
      options: DynamicState['options']
      second: boolean
    }>) {
      if (state.q?.type !== 'dynamic') return
      if (!action.payload.second) {
        state.q.options = action.payload.options
      } else {
        state.q.options2 = action.payload.options
      }
      state.q.editing = false
    },
    openOption(state, action: PayloadAction<{index: number, wrong: boolean, second: boolean}>) {
      if (state.q?.type !== 'dynamic') return
      const {index, wrong, second} = action.payload
      const options = second ? state.q.options2 : state.q.options
      options[index].opened = true
      options[index].wrong = wrong
      state.currentAttachments = {optionIndex: index, secondGroup: second}
      const team = index % 2 === 0 ? 'leftTeam' : 'rightTeam'
      if (wrong) {
        options[index].score = 0
        playWrong()
      } else {
        playCorrect()
        state[team].score += 5
      }
      if (options.every(option => option.opened)) {
        setTimeout(playFinish, 1000)
      }
    },
    switchToQuestion2(state) {
      if (state.q?.type !== 'dynamic') return
      state.q.showSecond = true
      state.questionShown = false
      state.q.editing = true
    },

    openFinale(state) {
      state.currentQuestion++
      state.subtotalShown = false
      state.finale = true
      const teamsOrder = ['leftTeam', 'rightTeam'] as Team[]
      teamsOrder.sort((a, b) => (state[b].wins - state[a].wins) * 100500 + state[b].cumulativeScore - state[a].cumulativeScore)
      const q = makeFinaleState()
      q.teamsOrder = teamsOrder
      state.q = q
      const lw = state.leftTeam.wins
      const rw = state.rightTeam.wins
      state.leftTeam.score = (lw - Math.min(lw, rw)) * 3
      state.rightTeam.score = (rw - Math.min(lw, rw)) * 3
      if (state.leftTeam.score > 0) state.leftTeam.score += 5
      if (state.rightTeam.score > 0) state.rightTeam.score += 5
      state.currentAttachments = null
    },
    setFinaleOptions(state, action: PayloadAction<{options: FinaleState['options'], teamIndex: number}>) {
      if (state.q?.type !== 'finale') return
      state.q.options = action.payload.options
      state.q.optionsDone[action.payload.teamIndex] = true
    },
    openFinaleQuestion(state, action: PayloadAction<number>) {
      if (state.q?.type !== 'finale') return
      state.q.openedQuestions[action.payload] = true
    },
    openFinaleOption(state, action: PayloadAction<{teamIndex: number, index: number}>) {
      if (state.q?.type !== 'finale') return
      const { teamIndex, index } = action.payload
      state.q.options[teamIndex][index].opened = true
      state.currentAttachments = {teamIndex, optionIndex: index}
    },
    openFinaleScore(state, action: PayloadAction<{teamIndex: number, index: number}>) {
      if (state.q?.type !== 'finale') return
      const { teamIndex, index } = action.payload
      const option = state.q.options[teamIndex][index]
      option.scoreOpened = true
      state[state.q.teamsOrder[teamIndex]].score += option.score
      if (option.score > 0) {
        playCorrect()
      } else {
        playWrong()
      }
    },
    setName(state, action: PayloadAction<{teamIndex: number, index: number, value: string}>) {
      if (state.q?.type !== 'finale') return
      const { teamIndex, index, value } = action.payload
      state.q.names[teamIndex][index] = value
    },
    hideAllOptions(state, action: PayloadAction<{teamIndex: number}>) {
      if (state.q?.type !== 'finale') return
      state.q.options[action.payload.teamIndex].forEach(option => option.opened = false)
    },
    hideAllQuestions(state) {
      if (state.q?.type !== 'finale') return
      state.q.openedQuestions.forEach((_, i, arr) => arr[i] = false)
    },

    makeSubtotal(state) {
      state.subtotalShown = true
      state.leftTeam.cumulativeScore += state.leftTeam.score
      state.rightTeam.cumulativeScore += state.rightTeam.score
      if (state.leftTeam.score >= state.rightTeam.score) {
        state.leftTeam.wins++
      }
      if (state.leftTeam.score <= state.rightTeam.score) {
        state.rightTeam.wins++
      }
    },
    showQuestion(state) {
      state.questionShown = true
    },
  },
})
type CorrectAnswerPayload = {
  index: number,
  score: number,
  best?: boolean,
  attachments: Attachment[],
  hasBonus: boolean,
}
function applyCorrectAnswer(
  state: GameState,
  payload: CorrectAnswerPayload
) {
  if (state.q?.type !== 'ordinary') return
  playCorrect()
  const option = state.q.options[payload.index]
  option.opened = true
  state.currentAttachments = {optionIndex: payload.index, bonus: false}
  if (state.currentTeam == null) return
  state[state.currentTeam].score += payload.score
  if (payload.hasBonus) {
    state.q.bonusChance = {
      optionIndex: payload.index,
      optionPayload: {
        best: payload.best ?? false,
        score: payload.score
      },
    }
  }
  if (state.q.drawFinished) {
    if (!payload.hasBonus) { 
      switchTeamIfPossible(state)
    }
  } else {
    if (state.q.bonusChance == null) {
      decideOnDraw(state, payload)
    }
  }
  decideIfRoundFinished(state)
}

function switchTeamIfPossible(state: GameState) {
  if (state.currentTeam == null) return
  const prevTeam = state.currentTeam
  const newTeam = theOtherTeam(prevTeam)
  if (canPlay(state, newTeam)) {
    state.currentTeam = newTeam
  } else if (canPlay(state, prevTeam)) {
    state.currentTeam = prevTeam
  } else {
    state.currentTeam = null
  }
}

function canPlay(state: GameState, team: Team): boolean {
  if (state[team].health === 0) {
    return false
  }
  if (state.q?.type === 'ordinary') {
    if (state.q.options.every(option => option.opened)) {
      const unresolvedBonuses = state.q.options.filter(({bonus}) => bonus != null && !bonus.opened)
      if (unresolvedBonuses.length > 0) {
        return !unresolvedBonuses.every(({bonus}) => !bonus?.vacantFor[team])
      }
    }
  }
  return true
}

function decideOnDraw(state: GameState, payload: {best?: boolean, score: number}) {
  if (state.q?.type !== 'ordinary') return
  if (state.currentTeam == null) return
  if (state.q.bidScore == null) {
    if (payload.best) {
      state.q.drawFinished = true
    } else {
      state.q.bidScore = payload.score
      state.currentTeam = theOtherTeam(state.currentTeam)
    }
  } else {
    if (state.q.bidScore >= payload.score) {
      state.currentTeam = theOtherTeam(state.currentTeam)
    }
    state.q.drawFinished = true
  }
}

export function areAllOptionsOpened(state: GameState) {
  if (state.currentQuestion >= 0) {
    if (state.q?.type !== 'ordinary') return false
    return state.q.options.every(option => (
      option.opened && (option.bonus == null || option.bonus.opened)
    ))
  }
  return false
}

function decideIfRoundFinished(state: GameState) {
  const prevRoundFinished = state.roundFinished
  const everyOneDead = (state.q?.type !== 'ordinary' || state.q.drawFinished) && state.currentTeam == null
  const allOptionsOpened = areAllOptionsOpened(state)
  state.roundFinished = everyOneDead || allOptionsOpened
  if (state.roundFinished && !prevRoundFinished) {
    setTimeout(playFinish, 1000)
  }
}

export const {
  startGame, finishGame,
  nextQuestion, chooseTeam, makeSubtotal,
  deltaScore, plusHealth,

  correctAnswer, wrongAnswer,
  correctBonus, discardBonusChance, wrongBonus,
  utilizeHealthChance, discardHealthChance,
  showQuestion,

  setOptions, openOption, switchToQuestion2,

  openFinale, openFinaleQuestion,
  setFinaleOptions, openFinaleOption, openFinaleScore,
  setName,
  hideAllOptions, hideAllQuestions,
} = gameSlice.actions

const visibilitySlice = createSlice({
  name: 'visibility',
  initialState: {
    attachment: null as null | Attachment,
  },
  reducers: {
    showAttachment(state, action: PayloadAction<Attachment>) {
      state.attachment = action.payload
    },
    deleteAttachment(state) {
      state.attachment = null
    },
    toggleAttachment(state, action: PayloadAction<Attachment>) {
      if (state.attachment === action.payload) {
        state.attachment = null
      } else {
        state.attachment = action.payload
      }
    },
  }
})

export const {
  showAttachment,
  deleteAttachment,
  toggleAttachment,
} = visibilitySlice.actions


// managing old versions
const CURRENT_VERSION = 11

if (localStorage.vladslav_version < 11) {
  localStorage.clear()
}

;(function() {
  if (localStorage.vladslav_version != CURRENT_VERSION && localStorage.vladslav) {
    const storage = JSON.parse(localStorage.vladslav)
    storage.game = GAME_INITIAL_STATE
    localStorage.vladslav = JSON.stringify(storage)
    localStorage.vladslav_version = CURRENT_VERSION
  }
})()

const localStorageConfig = {namespace: 'vladslav', ignoreStates: ['visibility', 'editor']}
const defaultState = load(localStorageConfig)


const store = configureStore({
  reducer: {
    [questionsSlice.name]: questionsSlice.reducer,
    [finaleSlice.name]: finaleSlice.reducer,
    [gameSlice.name]: undoable(gameSlice.reducer),
    [editorSlice.name]: editorSlice.reducer,
    [visibilitySlice.name]: visibilitySlice.reducer,
  },
  middleware: [save(localStorageConfig)],
  preloadedState: defaultState,
})
export default store

type RootState = ReturnType<typeof store.getState>
type AppDispatch = typeof store.dispatch
export const useDispatch: () => AppDispatch = useOriginalDispatch
export const useSelector: TypedUseSelectorHook<RootState> = useOriginalSelector
export function useGameSelector<T>(selector: (_: typeof GAME_INITIAL_STATE) => T) {
  return useSelector(state => selector(state.game.present))
}

window.addEventListener('keydown', e => {
  if (e.key === 's' && e.ctrlKey) {
    e.preventDefault()
    download('game-state.json', localStorage.vladslav)
  }
  if (e.key === 'o' && e.ctrlKey) {
    e.preventDefault()
    importState()
  }
})

function download(filename: string, text: string) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function importState() {
  const element = document.createElement('input')
  element.type = 'file'
  element.onchange = async () => {
    const file = element.files?.[0]
    const importedState = await file?.text()
    localStorage.vladslav = importedState
    location.reload()
  }
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}
