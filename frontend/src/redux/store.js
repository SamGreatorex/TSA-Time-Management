import { combineReducers} from 'redux'
import { configureStore } from '@reduxjs/toolkit'
import tasks  from "./reducers/tasks"
import timecards from "./reducers/timecards"


const reducer = combineReducers({
    tasks,
    timecards
  })

  const store = configureStore({
    reducer,
  })

export default store;