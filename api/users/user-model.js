const db = require('../../data/db-config.js')

module.exports = {
  findPosts,
  find,
  findById,
  add,
  remove
}

async function findPosts(user_id) {

  const posts = await db('users as u')
    .select('p.id as post_id', 'p.contents', 'u.username')
    .join('posts as p', 'u.id', '=', 'p.user_id')
    .where('u.id', user_id)
    
  return posts
  /*

  select 
    username,
    p.id,
    p.contents
from users as u
join posts as p
    on u.id = p.user_id
where username like 'socrates'
*/
}

async function find() { 
  const users = await db('users as u')
    .leftJoin('posts as p', 'p.user_id', 'u.id')
    .count('p.contents as post_count') 
    //translates to "collapse all u.usernames 
    //(if grouping exists, then into each group, 
    //then insert a column with the counts of u.username"
    .groupBy('u.username')
    .select('u.username', 'u.id as user_id',)
  return users
  /*
  select 
    username,
    u.id,
    count(username as post_count)
from users as u
left join posts as p
    on u.id = p.user_id
group by username


    [
        {
            "user_id": 1,
            "username": "lao_tzu",
            "post_count": 6
        },
        {
            "user_id": 2,
            "username": "socrates",
            "post_count": 3
        },
        etc
    ]
  */
}

async function findById(id) {
  const user = await db('users').where({ id }).first()
  const posts = await findPosts(id)

  const result = {
    user_id: user.id,
    username: user.username,
    posts: posts
  }

  return result

  // const posts = findPosts(id)
  /*
    Improve so it resolves this structure:

    {
      "user_id": 2,
      "username": "socrates"
      "posts": [
        {
          "post_id": 7,
          "contents": "Beware of the barrenness of a busy life."
        },
        etc
      ]
    }
  */
}

function add(user) {
  return db('users')
    .insert(user)
    .then(([id]) => { // eslint-disable-line
      return findById(id)
    })
}

function remove(id) {
  // returns removed count
  return db('users').where({ id }).del()
}
