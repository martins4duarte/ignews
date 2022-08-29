import { NextApiRequest, NextApiResponse } from 'next';


export default (request: NextApiRequest, response: NextApiResponse) => {
  const users = [
    { id: 1, name: 'Caio'},
    { id: 2, name: 'Martins'},
    { id: 3, name: 'Duarte'},
  ]

  return response.json(users)
}