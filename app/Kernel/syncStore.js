import { hashHistory } from 'react-router'

export default async function (store) {
  return new Promise((resolve) => {
    resolve(hashHistory)
  })
}
