import 'core-js/stable'
import 'regenerator-runtime/runtime'
import Aragon, { events } from '@aragon/api'

const app = new Aragon()

app.store(async (state, { event }) => {
  let nextState = { ...state }

  // Initial state
  if (state == null) {
    nextState = {
      servers: await getServers()
    }
  }

  switch (event) {
    case 'AddCatalyst':
    case 'RemoveCatalyst':
      nextState = { ...nextState, servers: await getServers() }
      break
    case events.SYNC_STATUS_SYNCING:
      nextState = { ...nextState, isSyncing: true }
      break
    case events.SYNC_STATUS_SYNCED:
      nextState = { ...nextState, isSyncing: false }
      break
  }

  return nextState
})

async function getServers() {
  const normalizedServers = []
  const servers = await app.call('size').toPromise()
  console.log(servers)
  for (let i = 0; i < servers; i++) {
    console.log(i, servers)
    const serveName = await app.call('servers', i).toPromise()
    const isAllowed = await app.call('catalystServers', i).toPromise()
    if (isAllowed) {
      normalizedServers.push(serveName)
    }
  }

  return normalizedServers
}
