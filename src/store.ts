import {
  TypedUseSelectorHook,
  useDispatch as useOriginalDispatch,
  useSelector as useOriginalSelector,
} from 'react-redux'
import { save, load } from 'redux-localstorage-simple'
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit'


const localStorageConfig = {namespace: 'vladslav'}
const defaultState = load(localStorageConfig)


export type Attachment =
| {type: 'text', text: string}
| {type: 'img', url: string}

export type BonusOption = {
  score: number
  opened: boolean
  attachment?: Attachment
}

export type Option = {
  value: string
  score: number
  opened: boolean
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
    openOption(state, action: PayloadAction<{questionIndex: number, optionIndex: number}>) {
      state[action.payload.questionIndex].options[action.payload.optionIndex].opened = true
    },
    openBonus(state, action: PayloadAction<{questionIndex: number, optionIndex: number}>) {
      const bonus = state[action.payload.questionIndex].options[action.payload.optionIndex].bonus
      if (bonus != null) {
        bonus.opened = true
      }
    },
    closeAllOptions(state) {
      state.forEach(question => question.options.forEach(option => {
        option.opened = false
        if (option.bonus != null) {
          option.bonus.opened = false
        }
      }))
    }
  }
})

export const {
  addQuestion, removeQuestion, editQuestion,
  openOption, openBonus, closeAllOptions
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

const GAME_INITIAL_STATE = {
  active: false,
  currentQuestion: -1,
  drawFinished: false,
  currentTeam: null as null | Team,
  bidScore: null as null | number,
  currentAttachment: null as null | Attachment & {show: boolean},
  bonusChance: null as null | {
    team: Team
    optionIndex: number
    score: number
    attachment?: Attachment
  },
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
    },
    chooseTeam(state, action: PayloadAction<'leftTeam' | 'rightTeam'>) {
      state.currentTeam = action.payload
    },
    correctAnswer(
      state,
      action: PayloadAction<{score: number, best?: boolean, worst?: boolean}>
    ) {
      if (state.currentTeam != null) {
        state[state.currentTeam].score += action.payload.score
        if (state.drawFinished) {
          const newTeam = theOtherTeam(state.currentTeam)
          if (state[newTeam].health > 0) {
            state.currentTeam = newTeam
          }
        } else {
          if (state.bidScore == null) {
            if (action.payload.best) {
              state.drawFinished = true
            } else if (action.payload.worst) {
              state.drawFinished = true
              state.currentTeam = theOtherTeam(state.currentTeam)
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
      }
    },
    correctBonus(state, action: PayloadAction<{team: Team, score: number}>) {
      state[action.payload.team].score += action.payload.score
      state.currentTeam = theOtherTeam(action.payload.team)
    },
    wrongAnswer(state) {
      if (state.currentTeam != null) {
        if (!state.drawFinished) {
          if (state.bidScore == null) {
            state.bidScore = 0
            state.currentTeam = theOtherTeam(state.currentTeam)
          } else if (state.bidScore == 0) {
            state.bidScore = null
            state.currentTeam = null
          } else {
            state.drawFinished = true
            state.bidScore = null
            state.currentTeam = theOtherTeam(state.currentTeam)
          }
        } else {
          state[state.currentTeam].health--
          const newTeam = theOtherTeam(state.currentTeam)
          if (state[newTeam].health > 0) {
            state.currentTeam = newTeam
          }
          if (state.leftTeam.health === 0 && state.rightTeam.health === 0) {
            state.currentTeam = null
          }
        }
      }
    },
    startGame(state) {
      state.active = true
    },
    finishGame(_) {
      return GAME_INITIAL_STATE
    },
    showAttachment(state) {
      if (state.currentAttachment != null) {
        state.currentAttachment.show = true
      }
    },
    hideAttachment(state) {
      if (state.currentAttachment != null) {
        state.currentAttachment.show = false
      }
    },
    setActiveAttachment(state, action: PayloadAction<Attachment | null | undefined>) {
      if (action.payload) {
        state.currentAttachment = {...action.payload, show: false}
      } else {
        state.currentAttachment = null
      }
    },
    setBonusChance(state, action: PayloadAction<typeof GAME_INITIAL_STATE['bonusChance']>) {
      state.bonusChance = action.payload
    },
  },
})

export const {
  nextQuestion, chooseTeam,
  correctAnswer, wrongAnswer, correctBonus,
  startGame, finishGame,
  showAttachment, hideAttachment, setActiveAttachment,
  setBonusChance,
} = gameSlice.actions

const store = configureStore({
  reducer: {
    [questionsSlice.name]: questionsSlice.reducer,
    [gameSlice.name]: gameSlice.reducer,
    [editorSlice.name]: editorSlice.reducer
  },
  middleware: [save(localStorageConfig)],
  preloadedState: defaultState,
})
export default store

type RootState = ReturnType<typeof store.getState>
type AppDispatch = typeof store.dispatch
export const useDispatch: () => AppDispatch = useOriginalDispatch
export const useSelector: TypedUseSelectorHook<RootState> = useOriginalSelector
