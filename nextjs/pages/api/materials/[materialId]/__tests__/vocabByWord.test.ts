import { createMocks } from 'node-mocks-http';
import { expect } from 'chai';
import { GetVocabByWordSentenceParams } from '../vocabByWord';
import handler from '../vocabByWord';
describe('GetVocabByWordSentenceParams', () => {
  it('should have a word and sentence property', () => {
    const params: GetVocabByWordSentenceParams = {
      word: 'hello',
      sentence: 'Hello, world!',
    };

    const { req, res } = createMocks()

    const response = handler(req, res)

    expect(response).to.have.property('words');
    expect(params).to.have.property('word');
    expect(params).to.have.property('sentence');
  });
});