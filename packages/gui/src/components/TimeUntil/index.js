// @flow

import React, { useState, useEffect } from "react"
import moment from "moment"

export default ({ time: targetTime }) => {
  const [currentTime, changeCurrentTime] = useState(Date.now())
  useEffect(() => {
    const interval = setInterval(() => {
      changeCurrentTime(Date.now())
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  if (currentTime > targetTime) return "Passed"

  const duration = moment.duration(targetTime - currentTime)

  return (
    duration.minutes() +
    ":" +
    duration
      .seconds()
      .toString()
      .padStart(2, "0")
  )
  // return moment(targetTime).from(currentTime)
}
