import {
  TypedUseSelectorHook,
  useDispatch as useOriginalDispatch,
  useSelector as useOriginalSelector,
  useStore as useOriginalStore,
} from 'react-redux'
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit'


export type Option = {
  value: string
  score: number
  withBonus: boolean
  opened: boolean
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
    closeAllOptions(state) {
      state.forEach(question => question.options.forEach(option => option.opened = false))
    }
  }
})

export const {
  addQuestion, removeQuestion, editQuestion,
  openOption, closeAllOptions
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

const GAME_INITIAL_STATE = {
  active: false,
  currentQuestion: -1,
  leftTeam: {
    score: 0,
    health: 3,
  },
  rightTeam: {
    score: 0,
    health: 3,
  },
  currentTeam: 'leftTeam' as 'leftTeam' | 'rightTeam'
}

const gameSlice = createSlice({
  name: 'game',
  initialState: GAME_INITIAL_STATE,
  reducers: {
    nextQuestion(state) {
      state.currentQuestion++
    },
    previousQuestion(state) {
      state.currentQuestion--
    },
    toggleCurrentTeam(state) {
      if (state.currentTeam === 'leftTeam') {
        state.currentTeam = 'rightTeam'
      } else {
        state.currentTeam = 'leftTeam'
      }
    },
    addScore(state, action: PayloadAction<number>) {
      state[state.currentTeam].score += action.payload
    },
    minusHealth(state) {
      state[state.currentTeam].health--
    },
    startGame(state) {
      state.active = true
    },
    finishGame(_) {
      return GAME_INITIAL_STATE
    }
  }
})

export const {
  nextQuestion, previousQuestion, toggleCurrentTeam, addScore, minusHealth,
  startGame, finishGame,
} = gameSlice.actions

const store = configureStore({
  reducer: {
    [questionsSlice.name]: questionsSlice.reducer,
    [gameSlice.name]: gameSlice.reducer,
    [editorSlice.name]: editorSlice.reducer
  }
})
export default store

type RootState = ReturnType<typeof store.getState>
type AppDispatch = typeof store.dispatch
export const useDispatch: () => AppDispatch = useOriginalDispatch
export const useSelector: TypedUseSelectorHook<RootState> = useOriginalSelector
