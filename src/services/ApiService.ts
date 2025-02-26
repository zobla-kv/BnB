// TODO: create models and update types

export const get = async (uuid: string): Promise<any> => {
  return fetch('http://localhost:3000/entities/' + uuid);
}

export const add = async (data: any): Promise<any> => {
  console.log('post')
  return fetch('http://localhost:3000/entities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export const patch = async (uuid: string, data: any): Promise<any> => {
  return fetch('http://localhost:3000/entities/' + uuid, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
}

