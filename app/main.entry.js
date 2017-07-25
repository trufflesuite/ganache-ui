if(process.env.NODE_ENV === 'development') {
  require('./main.development.js')
} else {
  require('./main.js')
}
