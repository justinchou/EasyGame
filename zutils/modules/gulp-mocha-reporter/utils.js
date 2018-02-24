/**
 * Created by EasyGame.
 * File: utils.js
 * User: justin
 * Date: 24/2/2018
 * Time: 09:37
 */

'use strict';

function objectEntries(object) {
    const entries = [];

    for (const key of Object.keys(object)) {
        const value = object[key];
        entries.push([key, value]);
    }

    return entries;
}

function convertObjectToList(object) {
    return objectEntries(object)
        .reduce((result, current) => result.concat(`${current[0]}=${current[1]}`), [])
        .join(',');
}

module.exports = {
    convertObjectToList
};
