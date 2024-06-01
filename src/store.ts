import {
  TypedUseSelectorHook,
  useDispatch as useOriginalDispatch,
  useSelector as useOriginalSelector,
} from 'react-redux'
import { save, load } from 'redux-localstorage-simple'
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit'
import undoable from 'redux-undo'


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

type EditorMode =
| {mode: 'view'}
| {mode: 'edit', index: number}
| {mode: 'add'}

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
    }
  }
})

export const { startEditing, finishEditing, startAdding } = editorSlice.actions

export type Team = 'leftTeam' | 'rightTeam'

const NUM_OPTIONS = 10
function makeDefaultOptions() {
  return Array(NUM_OPTIONS).fill(null).map(_ => ({
    opened: false,
    bonus: {
      opened: false,
      vacantFor: {
        leftTeam: true,
        rightTeam: true,
      }
    }
  }))
}

const GAME_INITIAL_STATE = {
  active: false,
  currentQuestion: -1,
  drawFinished: false,
  currentTeam: null as null | Team,
  bidScore: null as null | number,
  currentAttachment: null as null | undefined | Attachment,
  options: makeDefaultOptions(),
  bonusChance: null as null | {
    team: Team
    optionIndex: number
  },
  healthChance: null as null | Team,
  leftTeam: {
    score: 0,
    health: 3,
  },
  rightTeam: {
    score: 0,
    health: 3,
  },
}

function theOtherTeam(team: Team): Team {
  return team === 'leftTeam' ? 'rightTeam' : 'leftTeam'
}

const gameSlice = createSlice({
  name: 'game',
  initialState: GAME_INITIAL_STATE,
  reducers: {
    nextQuestion(state) {
      state.currentQuestion++
      state.leftTeam.health = state.rightTeam.health = 3
      state.bidScore = null
      state.drawFinished = false
      state.currentTeam = null
      state.options = makeDefaultOptions()
      state.currentAttachment = null
    },
    chooseTeam(state, action: PayloadAction<'leftTeam' | 'rightTeam'>) {
      state.currentTeam = action.payload
    },
    correctAnswer(
      state,
      action: PayloadAction<{
        index: number,
        score: number,
        best?: boolean,
        attachment?: Attachment,
        bonus?: BonusOption,
      }>
    ) {
      state.options[action.payload.index].opened = true
      state.currentAttachment = action.payload.attachment
      if (state.currentTeam == null) return
      state[state.currentTeam].score += action.payload.score
      if (action.payload.bonus != null) {
        state.bonusChance = {
          team: state.currentTeam,
          optionIndex: action.payload.index,
        }
      }
      if (state.drawFinished) {
        switchTeamIfAlive(state)
      } else {
        if (state.bidScore == null) {
          if (action.payload.best) {
            state.drawFinished = true
          } else {
            state.bidScore = action.payload.score
            state.currentTeam = theOtherTeam(state.currentTeam)
          }
        } else {
          if (state.bidScore >= action.payload.score) {
            state.currentTeam = theOtherTeam(state.currentTeam)
          }
          state.drawFinished = true
        }
      }
    },
    correctBonus(state, action: PayloadAction<{
      index: number,
      team: Team | null,
      score: number,
      attachment?: Attachment,
    }>) {
      state.options[action.payload.index].bonus.opened = true
      state.bonusChance = null
      state.currentAttachment = action.payload.attachment
      if (action.payload.team != null) {
        state[action.payload.team].score += action.payload.score
        switchTeamIfAlive(state, action.payload.team)
      }
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
        }
        switchTeamIfAlive(state)
      }
    },
    wrongBonus(state, action: PayloadAction<number>) {
      if (state.currentTeam == null) return
      state.options[action.payload].bonus.vacantFor[state.currentTeam] = false
      switchTeamIfAlive(state)
    },
    utilizeHealthChance(state) {
      if (state.healthChance == null) return
      state[state.healthChance].health++
      state.healthChance = null
    },
    discardHealthChance(state) {
      if (state.leftTeam.health === 0 && state.rightTeam.health === 0) {
        state.currentTeam = null
      }
      state.healthChance = null
    },
    discardBonusChance(state) {
      if (state.bonusChance == null) return
      state.options[state.bonusChance.optionIndex].bonus.vacantFor[state.bonusChance.team] = false
      state.bonusChance = null
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

function switchTeamIfAlive(state: typeof GAME_INITIAL_STATE, targetTeam?: Team) {
  if (state.currentTeam == null) return
  const newTeam = theOtherTeam(targetTeam ?? state.currentTeam)
  if (state[newTeam].health > 0) {
    state.currentTeam = newTeam
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

const attachmentVisibilitySlice = createSlice({
  name: 'attachmentVisible',
  initialState: false,
  reducers: {
    toggleAttachmentVisibility(state) {
      return !state
    }
  }
})

export const {
  toggleAttachmentVisibility,
} = attachmentVisibilitySlice.actions


const localStorageConfig = {namespace: 'vladslav'}
const defaultState = load(localStorageConfig)

// managing old versions
const CURRENT_VERSION = 1
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
    [gameSlice.name]: undoable(gameSlice.reducer),
    [editorSlice.name]: editorSlice.reducer,
    [attachmentVisibilitySlice.name]: attachmentVisibilitySlice.reducer,
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
