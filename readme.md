# Config

[![Build Status][ci-badge]][ci-badge-link]
[![Dependency Status][david-badge]][david-badge-link]
[![devDependency Status][david-dev-badge]][david-dev-badge-link]

```
npm install @sinet/config
```

Set watches in your config and edit/view them in Consul UI, add handler to act on changes.

### Usage

```javascript
const config = require('@sinet/config')()

config.watch('log.level', function (error, config) {
	const level = JSON.parse(config.value)

	// set new log level
	logger.setLevel(level)
})

logger.setLevel(config.log.level)
```

You can remove the first parameter to `config.watch` and it will watch changes to your whole config.

> Note: This requires that you have a Consul running somewhere and you must set the Consul port and host in your config file.

#### Parameters

- `dirname` - Set the path to your app's config values. By default, Config will fetch app config values in parent `config/index.js`.

```
require('@sinet/config')('../config')
```

#### Methods
- `watch` - Watches for changes on a specific config property or the whole config object if key is omitted. Parameters:
 - `key` - Config property to watch for changes i.e `db.connection.port`, `api.github.token`
 - `handler` - Function to execute when watched property is changed in Consul UI.

## Contributing
All pull requests must follow [coding conventions and standards](https://github.com/sinet/coding-conventions).

[david-badge]: https://david-dm.org/sinet/config.svg
[david-badge-link]: https://david-dm.org/sinet/config
[david-dev-badge]: https://david-dm.org/sinet/config/dev-status.svg
[david-dev-badge-link]: https://david-dm.org/sinet/config
[david-dev-badge-link]: https://david-dm.org/sinet/config#info=devDependencies
[ci-badge]: https://circleci.com/gh/sinet/config.svg?style=shield
[ci-badge-link]: https://circleci.com/gh/sinet/config
