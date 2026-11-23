import { Lumen } from "./Logger/lumen.ts"
import { functionForWarn } from "./secondFile.ts"

const funcForTest = () => {
  Lumen.debug('Hm... debuging is very cool...')
  Lumen.warn('This is my warning, bro.')
}

const main = () => {
  Lumen.log('Hello, Lumen Log! =)')
  Lumen.ok('Oh, this process is complete!')
  Lumen.error('Oh, this error... =(')
  funcForTest()
  functionForWarn()
  Lumen.warn(
    'Message with padding and custom marker and without function name and date',
    {
      options: {
        nameCaller: false,
        nameFileCaller: true,
        padding: true,
        timeCall: true,
        dateCall: false,
        marker: '[!]'
      }
    }
  )
  Lumen.log(
    'Second log with custom marker',
    {
      options: {
        marker: '★'
      }
    }
  )
  Lumen.ok('Success print default message', {
    options: {
      nameCaller: false,
      nameFileCaller: false,
      timeCall: false,
      dateCall: false,
    }
  })   

  Lumen.warn('Warn for telegram bot', {
    options: {
      telegram: {
        logInTelegram: true,
      }
    }
  })
}

main()