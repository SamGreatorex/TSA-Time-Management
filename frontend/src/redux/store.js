import { combineReducers} from 'redux'
import { configureStore } from '@reduxjs/toolkit'
import timecards from "./reducers/timecards"


const reducer = combineReducers({
    timecards
  })

  const store = configureStore({
    reducer,
  })

export default store;