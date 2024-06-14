import {
  TypedUseSelectorHook,
  useDispatch as useOriginalDispatch,
  useSelector as useOriginalSelector,
} from 'react-redux'
import { save, load } from 'redux-localstorage-simple'
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit'
import undoable from 'redux-undo'
import { finishSound } from './sounds'


export type Attachment =
| {type: 'text', text: string}
| {type: 'img', url: string}

export type BonusOption = {
  score: number
  attachment?: Attachment
}

export type Option = {
  value: string
  score: number
  attachment?: Attachment
  bonus?: BonusOption
}

export type Question = {
  value: string
  options: Option[]
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

const finaleSlice = createSlice({
  name: 'finale',
  initialState: null as null | FinaleQuestion[],
  reducers: {
    setFinale(_, action: PayloadAction<FinaleQuestion[]>) {
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
  drawFinished: false,
  currentTeam: null as null | Team,
  bidScore: null as null | number,
  currentAttachment: null as null | undefined | Attachment,
  options: makeDefaultOptions(),
  bonusChance: null as null | {
    optionPayload: {best?: boolean, score: number},
    optionIndex: number
  },
  healthChance: null as null | Team,
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
}
type GameState = typeof GAME_INITIAL_STATE

type BonusState = {
  opened: boolean
  vacantFor: Record<Team, boolean>
}
const NUM_OPTIONS = 10
function makeDefaultOptions() {
  return Array(NUM_OPTIONS).fill(null).map(_ => ({
    opened: false,
    bonus: null as BonusState | null | undefined
  }))
}

function theOtherTeam(team: Team): Team {
  return team === 'leftTeam' ? 'rightTeam' : 'leftTeam'
}

const gameSlice = createSlice({
  name: 'game',
  initialState: GAME_INITIAL_STATE,
  reducers: {
    nextQuestion(state, action: PayloadAction<boolean[]>) {
      state.currentQuestion++
      state.leftTeam.health = state.rightTeam.health = 3
      state.leftTeam.score = state.rightTeam.score = 0
      state.bidScore = null
      state.drawFinished = false
      state.currentTeam = null
      const options = makeDefaultOptions()
      action.payload.forEach((hasBonus, i) => options[i].bonus = hasBonus ? {
        opened: false,
        vacantFor: {leftTeam: true, rightTeam: true}
      } : null)
      state.options = options
      state.currentAttachment = null
      state.roundFinished = false
    },
    chooseTeam(state, action: PayloadAction<Team>) {
      state.currentTeam = action.payload
    },
    correctAnswer(
      state,
      action: PayloadAction<{
        index: number,
        score: number,
        best?: boolean,
        attachment?: Attachment,
        hasBonus: boolean,
      }>
    ) {
      const option = state.options[action.payload.index]
      option.opened = true
      state.currentAttachment = action.payload.attachment
      if (state.currentTeam == null) return
      state[state.currentTeam].score += action.payload.score
      if (action.payload.hasBonus) {
        state.bonusChance = {
          optionIndex: action.payload.index,
          optionPayload: {
            best: action.payload.best ?? false,
            score: action.payload.score
          },
        }
      }
      if (state.drawFinished) {
        if (!action.payload.hasBonus) { 
          switchTeamIfPossible(state)
        }
      } else {
        if (state.bonusChance == null) {
          decideOnDraw(state, action.payload)
        }
      }
      decideIfRoundFinished(state)
    },
    correctBonus(state, action: PayloadAction<{
      index: number,
      score: number,
      attachment?: Attachment,
    }>) {
      const bonus = state.options[action.payload.index].bonus
      if (bonus != null) bonus.opened = true
      state.currentAttachment = action.payload.attachment
      if (state.currentTeam != null) {
        state[state.currentTeam].score += action.payload.score
        if (state.drawFinished) {
          switchTeamIfPossible(state)
        } else if (state.bonusChance != null) {
          decideOnDraw(state, state.bonusChance.optionPayload)
        }
      }
      state.bonusChance = null
      decideIfRoundFinished(state)
    },
    wrongAnswer(state) {
      if (state.currentTeam == null) return
      if (!state.drawFinished) {
        state.currentTeam = theOtherTeam(state.currentTeam)
        if (state.bidScore == null) {
          state.bidScore = 0
        } else if (state.bidScore === 0) {
          state.bidScore = null
        } else {
          state.drawFinished = true
          state.bidScore = null
        }
      } else {
        state[state.currentTeam].health--
        if (state[state.currentTeam].health === 0) {
          state.healthChance = state.currentTeam
        } else {
          switchTeamIfPossible(state)
        }
      }
    },
    wrongBonus(state, action: PayloadAction<number>) {
      if (state.currentTeam == null) return
      const bonus = state.options[action.payload].bonus
      if (bonus != null) bonus.vacantFor[state.currentTeam] = false
      switchTeamIfPossible(state)
      decideIfRoundFinished(state)
    },
    utilizeHealthChance(state) {
      if (state.healthChance == null) return
      state[state.healthChance].health++
      state.healthChance = null
      switchTeamIfPossible(state)
    },
    discardHealthChance(state) {
      state.healthChance = null
      switchTeamIfPossible(state)
      decideIfRoundFinished(state)
    },
    discardBonusChance(state) {
      if (state.bonusChance == null || state.currentTeam == null) return
      const bonus = state.options[state.bonusChance.optionIndex].bonus
      if (bonus != null) bonus.vacantFor[state.currentTeam] = false
      if (state.drawFinished) {
        switchTeamIfPossible(state)
      } else if (state.bonusChance != null) {
        decideOnDraw(state, state.bonusChance.optionPayload)
      }
      state.bonusChance = null
      decideIfRoundFinished(state)
    },
    deltaScore(state, action: PayloadAction<{team: Team, value: number}>) {
      state[action.payload.team].score += action.payload.value
    },
    plusHealth(state, action: PayloadAction<Team>) {
      if (state[action.payload].health < 3) {
        state[action.payload].health += 1
      }
    },
    startGame(state) {
      state.active = true
    },
    finishGame(_) {
      return GAME_INITIAL_STATE
    },
  },
})

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
  if (state.options.every(option => option.opened)) {
    const unresolvedBonuses = state.options.filter(({bonus}) => bonus != null && !bonus.opened)
    if (unresolvedBonuses.length > 0) {
      return !unresolvedBonuses.every(({bonus}) => !bonus?.vacantFor[team])
    }
  }
  return true
}

function decideOnDraw(state: GameState, payload: {best?: boolean, score: number}) {
  if (state.currentTeam == null) return
  if (state.bidScore == null) {
    if (payload.best) {
      state.drawFinished = true
    } else {
      state.bidScore = payload.score
      state.currentTeam = theOtherTeam(state.currentTeam)
    }
  } else {
    if (state.bidScore >= payload.score) {
      state.currentTeam = theOtherTeam(state.currentTeam)
    }
    state.drawFinished = true
  }
}

export function areAllOptionsOpened(state: GameState) {
  if (state.currentQuestion >= 0) {
    return state.options.every(option => (
      option.opened && (option.bonus == null || option.bonus.opened)
    ))
  }
  return false
}

function decideIfRoundFinished(state: GameState) {
  const prevRoundFinished = state.roundFinished
  const everyOneDead = state.drawFinished && state.currentTeam == null
  const allOptionsOpened = areAllOptionsOpened(state)
  state.roundFinished = everyOneDead || allOptionsOpened
  if (state.roundFinished && !prevRoundFinished) {
    setTimeout(() => finishSound.play(), 1000)
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
  nextQuestion, chooseTeam,
  correctAnswer, wrongAnswer,
  correctBonus, discardBonusChance, wrongBonus,
  utilizeHealthChance, discardHealthChance,
  deltaScore, plusHealth,
  startGame, finishGame,
} = gameSlice.actions

const visibilitySlice = createSlice({
  name: 'visibility',
  initialState: {
    attachment: false,
    subtotal: false,
  },
  reducers: {
    toggleAttachmentVisibility(state) {
      state.attachment = !state.attachment
    },
    toggleSubtotalVisibility(state) {
      state.subtotal = !state.subtotal
    }
  }
})

export const {
  toggleAttachmentVisibility,
  toggleSubtotalVisibility,
} = visibilitySlice.actions


const localStorageConfig = {namespace: 'vladslav', ignoreStates: ['visibility', 'editor']}
const defaultState = load(localStorageConfig)

// managing old versions
const CURRENT_VERSION = 3
;(function() {
  const state = defaultState as any
  if (localStorage.vladslav_version != CURRENT_VERSION) {
    state.game = GAME_INITIAL_STATE
    localStorage.vladslav_version = CURRENT_VERSION
  }
})()


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
export function selectNextQuestionBonuses(state: RootState) {
  return state.questions[state.game.present.currentQuestion + 1]?.options?.map(option => option.bonus != null)
}
