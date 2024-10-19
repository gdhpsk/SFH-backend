// keep track of all change streams
const allChangeStreams = []

/**
 * @class MongoWatcher
 * @classdesc Class representing a wrapper utility around MongoDB change streams
 *
 * @param {MongoWatcherConfig} config - {@link MongoWatcherConfig | MongoWatcher configuration} object containing different options.
 * @param {MongoWatcherMeta} [meta] - {@link MongoWatcherMeta | optional MongoWatcher meta data} - pass object containing anything that needs to be printed with logs
 */

class MongoWatcher {
  constructor(config, meta) {
    const defaultConfig = {
      reWatchOnError: true,
      reWatchOnEnd: true,
      reWatchOnClose: true,
      reWatchOnServerElection: true,
      useResumeToken: true,
      pipeline: [],
      listeners: {},
      watchOptions: {}
    }

    this.config = { ...defaultConfig, ...config }
    this.meta = {
      origin: `MongoWatcher-${this.config.collectionName}`,
      ...meta
    }
    this.changeStream = undefined
  }

  /**
   * Start watching changes via MongoDB Change streams considering provided config
   * & with encapsulated rewatch & resuming logic
   */
  watch(isReWatch = false) {
    const { client, listeners = {}, ...restOfTheConfig } = this.config
    const {
      collectionName,
      pipeline = [],
      watchOptions = {},
      useResumeToken,
      reWatchOnError,
      reWatchOnEnd,
      reWatchOnClose,
      reWatchOnServerElection
    } = restOfTheConfig

    const { onChange, onError, onEnd, onClose } = listeners

    const defaultWatchOptions = { fullDocument: "updateLookup" }

    try {
      const collectionObj = client.db.collection(collectionName)
      this.changeStream = collectionObj.watch(pipeline, {
        ...defaultWatchOptions,
        ...watchOptions
      })

      console.info(
        `🚀 🚀 🚀 🚀 🚀 ${this.meta.origin}: Started watching change stream events 🚀 🚀 🚀 🚀 🚀`,
        { config: restOfTheConfig, isReWatch, ...this.meta }
      )

      allChangeStreams.push(this.changeStream)

      this.changeStream.on("change", change => {
        // track resume token if resuming is configured
        const resumeToken = change._id
        if (useResumeToken) {
          this.config.watchOptions.resumeAfter = resumeToken
        }

        // console.info(
        //   `🚚 🚚 🚚 🚚 🚚  ${this.meta.origin}: Received new change stream event 🚚 🚚 🚚 🚚 🚚 `,
        //   { resumeToken, ...this.meta }
        // )

        // console.debug(`[${this.meta.origin}]: change event`, {
        //   ...this.meta,
        //   change
        // })

        // call custom callback (if provided)
        if (onChange) {
          onChange(change)
        }
      })

      this.changeStream.on("error", data => {
        if (data?.codeName === "ChangeStreamHistoryLost") {
          // to avoid getting the same error infinitely, we need to discard resume token
          delete this.config.watchOptions.resumeAfter
        }

        console.error({
          title: `❌ ❌ Change stream errored! NO ACTION NEEDED - IT WILL BE RESUMED SHORTLY!`,
          origin: this.meta.origin,
          error: new Error(data?.codeName),
          meta: { ...this.meta, config: restOfTheConfig, data }
        })

        // call custom callback (if provided)
        if (onError) {
          onError(data)
        }

        if (reWatchOnError) {
          this.reWatch()
        }
      })

      this.changeStream.on("end", data => {
        console.warn(
          `👋 👋 👋 👋 👋  ${this.meta.origin}: Change stream ended! 👋 👋 👋 👋 👋 `,
          { ...this.meta, config: restOfTheConfig, data }
        )

        // call custom callback (if provided)
        if (onEnd) {
          onEnd(data)
        }

        if (reWatchOnEnd) {
          this.reWatch()
        }
      })

      this.changeStream.on("close", data => {
        console.info(
          `🔌 🔌 🔌 🔌 🔌  ${this.meta.origin}: Change stream closed! 🔌 🔌 🔌 🔌 🔌 `,
          { ...this.meta, config: restOfTheConfig, data }
        )

        // call custom callback (if provided)
        if (onClose) {
          onClose(data)
        }

        if (reWatchOnClose) {
          this.reWatch()
        }
      })

      if (reWatchOnServerElection && !isReWatch) {
        client.on("serverDescriptionChanged", event => {
          if (event?.newDescription?.type === "RSPrimary") {
            console.info(
              `💡💡💡💡💡💡 Server election event: New primary elected: ${event?.address}`,
              {
                event
              }
            )
            this.reWatch(true)
          }
        })
      }
    } catch (error) {
      console.error({
        title: `MongoWatcher: Error inside ${this.meta.origin}. Rewatch will be triggered!`,
        origin: this.meta.origin,
        error,
        meta: { meta: this.meta, config: restOfTheConfig }
      })
      this.reWatch()
    }
  }

  // private method
  reWatch(isServerElection = false) {
    const delayDuration = isServerElection ? 1000 : 5000
    if (this.changeStream) {
      // cleanup existing watchers & stream
      this.changeStream.removeAllListeners()
      this.changeStream.close()
    }

    console.warn(
      `⌛ ⌛ ⌛ ⌛ ⌛ ${this.meta.origin}: Rewatch will be triggered shortly! ⌛ ⌛ ⌛ ⌛ ⌛ `,
      { ...this.meta }
    )

    // add some delay for recovery (if connection issue) & then trigger watch
    setTimeout(() => {
      this.watch(true)

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { client, listeners = {}, ...restOfTheConfig } = this.config

      if (isServerElection) {
        console.warn(
          `🔁 🔁 🔁 🔁 🔁 ${this.meta.origin}: Re-initialized the watcher on server election 🔁 🔁 🔁 🔁 🔁`,
          { ...this.meta, config: restOfTheConfig }
        )
      } else {
        console.warn(
          `✅ ✅ ✅ ✅ ✅ ${this.meta.origin}: Re-initialized the watcher on detection of absence/closure of stream ✅ ✅ ✅ ✅ ✅`,
          { ...this.meta, config: restOfTheConfig }
        )
      }
    }, delayDuration)
  }
}

/** close all registered change streams : This will be useful for global cleanup (if required) */
function closeAllChangeStreams() {
  allChangeStreams?.forEach(changeStream => {
    if (changeStream) {
      // cleanup existing watchers & stream
      changeStream.removeAllListeners()
      changeStream.close()
    }
  })
}

module.exports = { closeAllChangeStreams, MongoWatcher }