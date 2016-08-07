import chai from 'chai';
import sinon from 'sinon';
import chaiEnzyme from 'chai-enzyme';
import sinonChai from 'sinon-chai'

chai.use(chaiEnzyme());
chai.use(sinonChai);

global.expect = chai.expect;
