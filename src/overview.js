import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';
import _ from 'lodash';

@inject(HttpClient)
export class Overview {
  pollingStatus = 'Idle';
  collection = null;

  constructor(http) {
    this.http = http;
  }

  startpolling() {
    this.blockRequests = false;
    this.timer = setInterval(() => {
      this.executePoll();
    }, 100);
    this.pollingStatus = 'Active';
  }

  stoppolling() {
    clearInterval(this.timer);
    this.pollingStatus = 'Idle';
  }

  executePoll() {
    if (this.blockRequests) {
      return;
    }
    this.blockRequests = true;
    this.fillNamespaces(() => {
      this.fillTopics(() => {
        this.fillSubscriptions(() => {
          this.namespaces = this.bufferedNamespaces;
          this.blockRequests = false;
        });
      });
    });
  }

  fillNamespaces(next) {
    return this.http.fetch('config/namespaces')
      .then((response) => {
        return response.json();
      })
      .then((result) => {
        if (result !== undefined) {
          this.bufferedNamespaces = result.namespaces;
          return next();
        }
      });
  }

  fillTopics(next) {
    let counter = 0;
    _.forEach(this.bufferedNamespaces, (namespace) => {
      return this.http.fetch(`${namespace.name}/topics`)
        .then((response) => {
          return response.json();
        })
        .then((result) => {
          if (result !== undefined) {
            namespace.topics = result.topics;
            if (++counter === this.bufferedNamespaces.length) {
              return next();
            }
          }
        });
    });
  }

  fillSubscriptions(next) {
    let counter = 0;
    let endCounter = 0;
    _.forEach(this.bufferedNamespaces, (namespace) => {
      // endCounter += namespace.topics.length;
      _.forEach(namespace.topics, (topic) => {
        endCounter++;
        return this.http.fetch(`${namespace.name}/${topic.name}/subscriptions`)
          .then((response) => {
            return response.json();
          })
          .then((result) => {
            if (result !== undefined) {
              topic.subscriptions = result.subscriptions;
              if (++counter === endCounter) {
                return next();
              }
            }
          });
      });
    });
  }
}
