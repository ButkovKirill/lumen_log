import { Logger } from "./Logger/logger.ts"

const funcForTest = () => {
  Logger.debug('Hm... debuging is very cool...')
  Logger.warn('This is my warning, bro.')
}

const main = () => {
  Logger.log('Hello, Lumen Log! =)')
  Logger.ok('Oh, this process is complete!')
  Logger.error('Oh, this error... =(')

  funcForTest()
}

main()