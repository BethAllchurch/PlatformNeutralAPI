var should = require( 'chai' ).should();
var expect = require( 'chai' ).expect;
var supertest = require( 'supertest' );
var api = supertest( 'http://localhost:3000' );