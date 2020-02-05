import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

const loadedScripts = []
function useScript(src) {
  const [state, setState] = useState({
    loaded: false,
    error: false,
  })

  useEffect(
    // eslint-disable-next-line consistent-return
    () => {
      if (loadedScripts.includes(src)) {
        setState({
          loaded: true,
          error: false,
        })
      } else {
        loadedScripts.push(src)

        // Create script
        const script = document.createElement('script')
        script.src = src
        script.async = true
        script.defer = true

        const onScriptLoad = () => {
          setState({
            loaded: true,
            error: false,
          })
        }

        const onScriptError = () => {
          const index = loadedScripts.indexOf(src)
          if (index >= 0) loadedScripts.splice(index, 1)
          script.remove()

          setState({
            loaded: true,
            error: true,
          })
        }

        script.addEventListener('load', onScriptLoad)
        script.addEventListener('error', onScriptError)

        document.body.appendChild(script)

        // Remove event listeners on cleanup
        return () => {
          script.removeEventListener('load', onScriptLoad)
          script.removeEventListener('error', onScriptError)
        }
      }
    },
    [src],
  )

  return [state.loaded, state.error]
}

const assignRecaptchaCallback = (callback, sitekey) => () => {
  window.recaptchaOnloadCallback = () => {
    const { grecaptcha } = window
    grecaptcha.render(document.getElementById('loginRecaptcha'), { callback, sitekey })
  }
}

export const Recaptcha = ({ onValidate, siteKey }) => {
  useEffect(assignRecaptchaCallback(onValidate, siteKey), [])
  useScript('https://www.google.com/recaptcha/api.js?onload=recaptchaOnloadCallback&render=explicit')

  return <div id="loginRecaptcha" />
}

Recaptcha.propTypes = {
  onValidate: PropTypes.func.isRequired,
  siteKey: PropTypes.string.isRequired,
}
