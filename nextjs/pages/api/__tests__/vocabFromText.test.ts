import { createMocks } from 'node-mocks-http';
import { expect } from 'chai';
import handler from '../vocabFromText';
describe('GetVocabByWordSentenceParams', () => {
  it('should have a word and sentence property', () => {

    const params = {
      text: 'hello',
    };

    const { req, res } = createMocks()

    req.body = params

    const response = handler(req, res)

    expect(response).to.have.property('words');
    expect(params).to.have.property('word');
    expect(params).to.have.property('sentence');
  });
});