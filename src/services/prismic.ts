import * as prismic from '@prismicio/client'
import sm from '../../sm.json'

export function getPrismicClient(req?: unknown){

  const client = prismic.createClient(sm.repoName, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN
  })
   
  return client
}