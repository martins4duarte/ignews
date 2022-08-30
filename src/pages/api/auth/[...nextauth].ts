import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { query as queryFauna } from 'faunadb'
import { fauna } from "../../../services/fauna"

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'read:user',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({user, account, profile}) {
      const userData = user

      try {
        await fauna.query(
          queryFauna.Create(
            queryFauna.Collection('users'),
            { data: userData }
          )
        )
  
  
        return true
      } catch (e) {
        console.log(e)
      }
    }
  }
})