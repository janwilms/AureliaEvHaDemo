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
    this.timer = setInterval(() => {
      this.executePoll(this);
    }, 2000);
    this.pollingStatus = 'Active';
  }

  stoppolling() {
    //clearInterval(this.timer);
    this.pollingStatus = 'Idle';
  }

  executePoll(self) {
    self.fillNamespaces(() => {
      self.fillTopics(() => {
        self.fillSubscriptions(() => {
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
          this.namespaces = result.namespaces;
          return next();
        }
      });
  }

  fillTopics(next) {
    _.forEach(this.namespaces, (namespace) => {
      return this.http.fetch(`${namespace.name}/topics`)
        .then((response) => {
          return response.json();
        })
        .then((result) => {
          if (result !== undefined) {
            namespace.topics = result.topics;
            return next();
          }
        });
    });
    return next();
  }

  fillSubscriptions(next) {
    _.forEach(this.namespaces, (namespace) => {
      _.forEach(namespace.topics, (topic) => {
        return this.http.fetch(`${namespace.name}/${topic.name}/subscriptions`)
          .then((response) => {
            return response.json();
          })
          .then((result) => {
            if (result !== undefined) {
              topic.subscriptions = result.subscriptions;
              return next();
            }
          });
      });
    });
    return next();
  }
}
