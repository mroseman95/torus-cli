'use strict';

const Descriptor = require('./descriptor').Descriptor;

const service = exports;

class Service extends Descriptor {
  static read (filePath) {
    return new Promise((resolve, reject) => {
      return super.read(Service, 'service', filePath).then((descriptor) => {
        resolve(descriptor);
      }).catch(reject);
    });
  }
}

service.Service = Service;