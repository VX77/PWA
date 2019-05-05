

export default function ({ store, redirect }) {

  if (!store.state.auth.auth) {
    return redirect('/login')
  }
}

