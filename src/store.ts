import {
  TypedUseSelectorHook,
  useDispatch as useOriginalDispatch,
  useSelector as useOriginalSelector,
} from 'react-redux'
import { save, load } from 'redux-localstorage-simple'
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit'
import undoable from 'redux-undo'
import { playCorrect, playWrong } from './Audio'
import { NUM_DYNAMIC_OPTIONS, NUM_FINALE_OPTIONS } from './defaults'


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
  roundStarted: false,
  currentAttachments: null as null | {
    optionIndex: number
    bonus?: boolean
    teamIndex?: number
  },
  roundFinished: false,
  leftTeam: {
    name: '',
    cumulativeScore: 0,
    wins: 0,
    score: 0,
  },
  rightTeam: {
    name: '',
    cumulativeScore: 0,
    wins: 0,
    score: 0,
  },
  q: null as null | OrdinaryState | DynamicState | FinaleState,
}
type GameState = typeof GAME_INITIAL_STATE

function makeDefaultOrdinaryOptions(question: OrdinaryQuestion) {
  return Array(question.options.length).fill(null).map((_, i) => ({
    opened: false,
    guessedBy: {leftTeam: false, rightTeam: false},
    bonus: question.options[i].bonus == null ? null : {
      opened: false,
      openedBy: null as null | Team,
    }
  }))
}

function makeOrdinaryState(question: OrdinaryQuestion) {
  return {
    type: 'ordinary' as 'ordinary',
    options: makeDefaultOrdinaryOptions(question),
  }
}
export type OrdinaryState = ReturnType<typeof makeOrdinaryState>

function makeDynamicState() {
  return {
    type: 'dynamic' as 'dynamic',
    options: makeDynamicOptions(),
    editing: true,
  }
}
export type DynamicState = ReturnType<typeof makeDynamicState>

function makeDynamicOptions() {
  return Array(NUM_DYNAMIC_OPTIONS).fill(null).map(_ => ({
    value: '',
    attachments: [] as Attachment[],
    score: 1,
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

const gameSlice = createSlice({
  name: 'game',
  initialState: GAME_INITIAL_STATE,
  reducers: {
    setTeamsNames(state, action: PayloadAction<{leftTeam: string, rightTeam: string}>) {
      state.leftTeam.name = action.payload.leftTeam
      state.rightTeam.name = action.payload.rightTeam
    },
    startGame(state) {
      state.active = true
    },
    finishGame(_) {
      return GAME_INITIAL_STATE
    },
    nextQuestion(state, action: PayloadAction<Question | undefined>) {
      state.currentQuestion++
      state.roundStarted = false
      state.roundFinished = false
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
    openOrdinaryOption(
      state: GameState,
      action: PayloadAction<{
        index: number,
        score: number,
      }>
    ) {
      if (state.q?.type !== 'ordinary') return
      const payload = action.payload
      const option = state.q.options[payload.index]
      option.opened = true
      state.currentAttachments = {optionIndex: payload.index, bonus: false}
      if (option.guessedBy.leftTeam) {
        state.leftTeam.score += payload.score
      }
      if (option.guessedBy.rightTeam) {
        state.rightTeam.score += payload.score
      }
      if (option.guessedBy.leftTeam || option.guessedBy.rightTeam) {
        playCorrect()
      } else {
        playWrong()
      }
      decideIfRoundFinished(state)
    },
    toggleGuess(state, action: PayloadAction<{team: Team, index: number}>) {
      if (state.q?.type !== 'ordinary') return
      const option = state.q.options[action.payload.index]
      option.guessedBy[action.payload.team] = !option.guessedBy[action.payload.team]
    },
    correctBonus(state, action: PayloadAction<{
      score: number,
      team?: Team | null
    }>) {
      if (state.q?.type !== 'ordinary') return
      const option = selectOptionWithVacantBonus(state)
      if (option == null) return
      option.bonus.opened = true
      const optionIndex = state.q.options.indexOf(option)
      state.currentAttachments = {optionIndex, bonus: true}
      if (action.payload.team != null) {
        state[action.payload.team].score += action.payload.score
        playCorrect()
      } else {
        playWrong()
      }
      decideIfRoundFinished(state)
    },
    wrongBonus(state, action: PayloadAction<{team: Team}>) {
      if (state.q?.type !== 'ordinary') return
      const option = selectOptionWithVacantBonus(state)
      if (option == null) return
      option.guessedBy[action.payload.team] = false
      if (option.bonus == null) return // always false
      if (!option.guessedBy.leftTeam && !option.guessedBy.rightTeam) {
        option.bonus.opened = true
        const optionIndex = state.q.options.indexOf(option)
        state.currentAttachments = {optionIndex, bonus: true}
      }
      decideIfRoundFinished(state)
      playWrong()
    },
    deltaScore(state, action: PayloadAction<{team: Team, value: number}>) {
      state[action.payload.team].score += action.payload.value
    },

    setOptions(state, action: PayloadAction<{
      options: DynamicState['options']
    }>) {
      if (state.q?.type !== 'dynamic') return
      state.q.options = action.payload.options
      state.q.editing = false
    },
    openDynamicOption(state, action: PayloadAction<{index: number, wrong: boolean}>) {
      if (state.q?.type !== 'dynamic') return
      const {index, wrong} = action.payload
      const options = state.q.options
      options[index].opened = true
      options[index].wrong = wrong
      state.currentAttachments = {optionIndex: index}
      const team = index % 2 === 0 ? 'leftTeam' : 'rightTeam'
      if (wrong) {
        options[index].score = 0
        playWrong()
      } else {
        playCorrect()
        state[team].score += 1
      }
      decideIfRoundFinished(state)
    },
    startEditingDynamicOptions(state) {
      if (state.q?.type !== 'dynamic') return
      state.q.editing = true
    },

    openFinale(state) {
      state.currentQuestion++
      state.finale = true
      const teamsOrder = ['leftTeam', 'rightTeam'] as Team[]
      teamsOrder.sort((a, b) => (state[b].wins - state[a].wins) * 100500 + state[b].cumulativeScore - state[a].cumulativeScore)
      const q = makeFinaleState()
      q.teamsOrder = teamsOrder
      state.q = q
      const lw = state.leftTeam.wins
      const rw = state.rightTeam.wins
      state.leftTeam.score = (lw - Math.min(lw, rw)) * 4
      state.rightTeam.score = (rw - Math.min(lw, rw)) * 4
      if (state.leftTeam.score > 0) state.leftTeam.score += 4
      if (state.rightTeam.score > 0) state.rightTeam.score += 4
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
    startEditingFinaleOptions(state, action: PayloadAction<{teamIndex: number}>) {
      if (state.q?.type !== 'finale') return
      state.q.optionsDone[action.payload.teamIndex] = false
    },
    startRound(state) {
      state.roundStarted = true
    },
  },
})

export function areAllOptionsOpened(state: GameState) {
  if (state.currentQuestion >= 0) {
    if (state.q?.type === 'ordinary') {
      return state.q.options.every(option => (
        option.opened && (option.bonus == null || option.bonus.opened)
      ))
    } else if (state.q?.type === 'dynamic') {
      return state.q.options.every(option => option.opened)
    }
  }
  return false
}

function decideIfRoundFinished(state: GameState) {
  const allOptionsOpened = areAllOptionsOpened(state)
  if (allOptionsOpened && !state.roundFinished) {
    state.roundFinished = true

    state.leftTeam.cumulativeScore += state.leftTeam.score
    state.rightTeam.cumulativeScore += state.rightTeam.score
    if (state.leftTeam.score >= state.rightTeam.score) {
      state.leftTeam.wins++
    }
    if (state.leftTeam.score <= state.rightTeam.score) {
      state.rightTeam.wins++
    }
  }
}

export const {
  setTeamsNames,
  startGame, finishGame,
  nextQuestion,
  deltaScore,

  toggleGuess, openOrdinaryOption,
  correctBonus, wrongBonus,
  startRound,

  setOptions, openDynamicOption,
  startEditingDynamicOptions,

  openFinale, openFinaleQuestion,
  setFinaleOptions, openFinaleOption, openFinaleScore,
  setName,
  hideAllOptions, hideAllQuestions,
  startEditingFinaleOptions,
} = gameSlice.actions

const visibilitySlice = createSlice({
  name: 'visibility',
  initialState: {
    attachment: null as null | Attachment,
    gameScreenVisible: true,
    subtotalVisible: false,

    questionHidden: false,
  },
  reducers: {
    showAttachment(state, action: PayloadAction<Attachment>) {
      state.attachment = action.payload
    },
    toggleAttachment(state, action: PayloadAction<Attachment>) {
      if (state.attachment === action.payload) {
        state.attachment = null
      } else {
        state.attachment = action.payload
      }
    },
    toggleGameScreen(state) {
      state.gameScreenVisible = !state.gameScreenVisible
    },
    toggleSubtotal(state) {
      state.subtotalVisible = !state.subtotalVisible
    },
    hideAll(state) {
      state.attachment = null
      state.gameScreenVisible = true
      state.subtotalVisible = false
    },

    toggleQuestion(state) {
      state.questionHidden = !state.questionHidden
    },
    showQuestion(state) {
      state.questionHidden = false
    },
  }
})

export const {
  showAttachment,
  toggleAttachment,
  toggleGameScreen,
  toggleSubtotal,
  hideAll,

  toggleQuestion,
  showQuestion,
} = visibilitySlice.actions


// managing old versions
const CURRENT_VERSION = 13

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
export function useGameSelector<T>(selector: (_: GameState) => T) {
  return useSelector(state => selector(state.game.present))
}

export function selectOptionWithVacantBonus(state: GameState) {
  if (state.q?.type !== 'ordinary') return null
  for (const option of state.q.options) {
    if (option.opened && option.bonus != null && !option.bonus.opened) {
      return option as typeof option & {bonus: typeof option.bonus}
    }
  }
  return null
}