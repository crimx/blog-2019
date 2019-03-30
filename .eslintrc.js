module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: ['standard', 'standard-react'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}
