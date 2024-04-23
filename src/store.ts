import {
  TypedUseSelectorHook,
  useDispatch as useOriginalDispatch,
  useSelector as useOriginalSelector,
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
  drawFinished: false,
  currentTeam: null as null | 'leftTeam' | 'rightTeam',
  bidScore: null as null | number,
  leftTeam: {
    score: 0,
    health: 3,
  },
  rightTeam: {
    score: 0,
    health: 3,
  },
}

function theOtherTeam(team: 'leftTeam' | 'rightTeam'): typeof team {
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
    correctAnswer(state, action: PayloadAction<{score: number, best?: boolean, worst?: boolean}>) {
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
    wrongAnswer(state) {
      if (state.currentTeam != null) {
        state[state.currentTeam].health--
        const newTeam = theOtherTeam(state.currentTeam)
        if (state[newTeam].health > 0) {
          state.currentTeam = newTeam
        }
        if (!state.drawFinished) {
          state.drawFinished = true
        }
        if (state.leftTeam.health === 0 && state.rightTeam.health === 0) {
          state.currentTeam = null
        }
      }
    },
    startGame(state) {
      state.active = true
    },
    finishGame(_) {
      return GAME_INITIAL_STATE
    }
  },
})

export const { nextQuestion, chooseTeam, correctAnswer, wrongAnswer, startGame, finishGame } = gameSlice.actions

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
