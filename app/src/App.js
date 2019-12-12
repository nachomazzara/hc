import React, { useState } from 'react'
import { useAragonApi } from '@aragon/api-react'
import { Main, Button } from '@aragon/ui'
import styled from 'styled-components'

function App() {
  const { api, appState } = useAragonApi()
  const { servers, isSyncing } = appState
  const [inputValue, setInputValue] = useState('')
  console.log(servers, isSyncing, inputValue)
  return (
    <Main>
      <BaseLayout>
        {isSyncing ? (
          <Syncing />
        ) : (
          <>
            <h1>Catalyst Servers</h1>
            {servers.map(server => (
              <div
                key={server}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  alignContent: 'center',
                  justifyContent: 'space-between',
                  width: '40%'
                }}
              >
                <p style={{ marginTop: '20px' }}>{server}</p>
                <Buttons>
                  <Button
                    mode="secondary"
                    onClick={() => api.modify(server, false).toPromise()}
                  >
                    Remove
                  </Button>
                </Buttons>
              </div>
            ))}
            <Buttons>
              <input
                type="text"
                placeholder="https://google.com/"
                value={inputValue}
                onChange={e => setInputValue(e.currentTarget.value)}
              />
              <Button
                mode="secondary"
                onClick={() => api.modify(inputValue, true).toPromise()}
              >
                Add server
              </Button>
            </Buttons>
          </>
        )}
      </BaseLayout>
    </Main>
  )
}

const BaseLayout = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  flex-direction: column;
`

const Count = styled.h1`
  font-size: 30px;
`

const Buttons = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 40px;
  margin-top: 20px;
`

const Syncing = styled.div.attrs({ children: 'Syncing…' })`
  position: absolute;
  top: 15px;
  right: 20px;
`

export default App
