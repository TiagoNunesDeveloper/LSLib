!function (window, undefined) {

    let utils = {

        serialize: (data) => {
            return JSON.stringify(data);
        },

        unserialize: (data) => {
            if (data == null) return undefined;
            return JSON.parse(data);
        },

        gettype: (value) => {
            return Object.prototype.toString.call(value)
        },

        isJSON: (value) => {
            let regex = new RegExp(/^[\[|\{](\s|.*|\w)*[\]|\}]$/);
            return regex.test(value)
        }
    };

  let storeSQL = function (prefix, store) {
    this.prefix = prefix;
    this.store = store;

    this.setPrefix = (key) => {
        return `${this.prefix}${key}`
    }

    this.create = (key, data) => {
        key = this.setPrefix(key)

        if (!exists(this.store, key)) {
            this.store.setItem(
                key,
                utils.serialize(data)
            )
        }
        return this
    }

    this.insert = (key, data) => {
        key = this.setPrefix(key)
        let _data = utils.unserialize(this.store.getItem(key))
        let _value;

        if (utils.gettype(_data) == '[object Array]') {
            _data.push(data)
            _value = _data
        }

        if (utils.gettype(_data) == '[object Object]') {
            _value = Object.assign(_data, data)
        }

        if (exists(this.store, key)) {
            this.store.setItem(
                key,
                utils.serialize(_value)
            )
        }

    }

    this.select = (key,data = '') => {
        key = this.setPrefix(key)
        
        let _return = utils.unserialize(this.store.getItem(key));

        if(data.length){

            if(utils.gettype(_return) == '[object Array]'){
              _return = selectResult(_return,data);
            }else if(utils.gettype(_return) == '[object Object]'){
              _return = createObject(_return,data);  
            }
        }

        return _return;
    }

    this.update = (key, input) => {
        
        let originalKey = key;
        key = this.setPrefix(key)
        
        let data = utils.unserialize(this.store.getItem(key));
        
        const objectUpdate = [];

        let keysNotExists = Object.keys(input).filter(value => {
            if(!Object.keys(data).includes(value)){
               return value
            }else{
                objectUpdate.push(value)
            }
        });

        let dataUpdate = createObject(input,objectUpdate);
        this.insert(originalKey,dataUpdate);

        if(keysNotExists.length){
            console.log(`These fields don't exist: [${keysNotExists}] in ('${originalKey}')`)
        }
    }

    this.where = (key, data) => {}

    this.remove = (key) => {
        let self_key;

        if (utils.gettype(key) == '[object Array]') {
            key.map(indice => this.setPrefix(indice))
                .forEach(_key => this.store.removeItem(_key))
        } else {
            self_key = this.setPrefix(key);
        }

        this.store.removeItem(self_key);
    }

    this.clearAll = () => {

        this.list()
            .map(indice => this.setPrefix(indice))
            .forEach(key => this.store.removeItem(key))

    }

    this.list = () => {
        
        return Object.keys(this.store)
                     .filter(key => key.startsWith(this.prefix))
                     .map(key => key.replace(this.prefix, ''));
    }
  }

  const exists = (sql, key) => {
      return !!sql.getItem(key)
  }

  const selectResult = (result,data) => {

    return result.map(input => {
          return createObject(input,data);
     });
  }

  const createObject = (input,data) => {

      let response = {};
  
      data.forEach((item) =>{
          response[item] = input[item]
      });

      return response
  }

  if (typeof define === 'function' && define.amd) {
      define(function () {
          return { storeSQL: storeSQL };
      });
  } else if (typeof exports !== 'undefined') {
      module.exports = storeSQL;
  } else {
      window.storeSQL = storeSQL;
  }

}(window);