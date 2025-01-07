const express = require('express');
const { Pool } = require('pg');
const TWITCH = require('../twitchOauth');


// Create a Postgres Connection 
const POOL = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'spycy',
    password: 'postgres',
});


module.exports = {
    pool: POOL,
    twitch: TWITCH
};