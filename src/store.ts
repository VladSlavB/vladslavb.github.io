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
    }
  }
})

export const { addQuestion, removeQuestion, editQuestion } = questionsSlice.actions

const gameSlice = createSlice({
  name: 'game',
  initialState: {
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
  },
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
    }
  }
})

export const { nextQuestion, previousQuestion, toggleCurrentTeam, addScore, minusHealth } = gameSlice.actions

const store = configureStore({
  reducer: {
    [questionsSlice.name]: questionsSlice.reducer,
    [gameSlice.name]: gameSlice.reducer
  }
})
export default store

type RootState = ReturnType<typeof store.getState>
type AppDispatch = typeof store.dispatch
type Store = typeof store
export const useDispatch: () => AppDispatch = useOriginalDispatch
export const useSelector: TypedUseSelectorHook<RootState> = useOriginalSelector
export const useStore: () => Store = useOriginalStore
