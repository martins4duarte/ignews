import { GetStaticProps } from 'next'
import Head from 'next/head'
import { getPrismicClient } from '../../services/prismic'
import * as prismic from '@prismicio/client'
import { RichText } from 'prismic-dom'
import styles from './styles.module.scss'
import Link from 'next/link'

type Post = {
  slug: string;
  title: string;
  content: string;
  updatedAt: string;
}

interface IPostProps {
  posts: Post[]
}


export default function Posts({ posts }: IPostProps) {
  return (
    <>
      <Head>
      <title>Posts | Ignews</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          { posts.map(post => (
            <Link href={`/posts/${post.slug}`} key={post.slug}>
              <a>
                <time>{post.updatedAt}</time>
                <strong>{post.title}</strong>
                <p>{post.content}</p>
              </a>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}


export const getStaticProps: GetStaticProps = async () => {
  const prismicClient = getPrismicClient()

  const response = await prismicClient.get({ 
    predicates: [
      prismic.predicate.at("document.type", "posts")
    ],
    fetch: ['Posts.title', 'Posts.content'],
    pageSize: 100,
  })

  const posts = response.results.map( post => {
    return {
      slug: post.uid,
      title: RichText.asText(post.data.title),
      content: post.data.content.find(content => content.type === 'paragraph')?.text ?? '',
      updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    }
  })
  
  return {
    props: {
      posts
    }
  }
}
