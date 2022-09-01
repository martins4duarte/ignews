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
          queryFauna.If( // Query Fauna to search user, if not exists create, else Get it
            queryFauna.Not(
              queryFauna.Exists(
                queryFauna.Match(
                  queryFauna.Index('user_by_email'),
                  queryFauna.Casefold(user.email)
                )
              )
            ),
            queryFauna.Create(
              queryFauna.Collection('users'),
              { data: userData }
            ),
            queryFauna.Get(
              queryFauna.Match(
                queryFauna.Index('user_by_email'),
                queryFauna.Casefold(user.email)
              )
            )
          )
        )
  
  
        return true
      } catch (e) {
        console.log(e)
      }
    }
  }
})