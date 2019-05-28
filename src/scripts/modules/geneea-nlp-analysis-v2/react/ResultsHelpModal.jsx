import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {Modal} from 'react-bootstrap';
import Markdown from '../../../react/common/Markdown';

const content = `
The result contains these tables:

* \`analysis-result-documents\` document-level results with the following columns:
    * all \`id\` -- columns from the input table (used as primary keys)
    * \`language\` -- detected language of the document, as ISO 639-1 language code
    * \`sentimentPolarity\` -- polarity of _sentimentValue_ (_1_, _0_ or _-1_)
    * \`sentimentLabel\` -- sentiment of the document as a label (_positive_, _neutral_ or _negative_)
    * \`usedChars\` -- the number of characters used by this document


* \`analysis-result-entities\` -- entity-level results with the following columns:
    * all \`id\` -- columns from the input table
    * \`type\`-- type of the found entity, e.g. _person_, _organization_ or _tag_
    * \`text\` -- disambiguated and standardized form of the entity, e.g. _John Smith_, _Keboola_, _safe carseat_
    * \`score\` -- expresses the importance of a tag in the text 
    * \`entityUid\` -- ID of the entity
    * \`sentimentValue\` -- average detected sentiment of the sentences with this entity (a decimal number between _-1_ and _1_)
    * \`sentimentPolarity\` -- polarity of _sentimentValue_ (_1_, _0_ or _-1_)
    * \`sentimentLabel\` -- _sentimentValue_ expressed as a label (_positive_, _neutral_ or _negative_)


* \`analysis-result-relations\` table contains relations and attributes found in the text. For example, _good_ in _a good pizza_ or _the pizza is good_ is an attribute of _pizza_, while _eat_ in _John ate a pizza_ is a relation between _John_ and _pizza_. The table has the following columns:
    * all \`id\` -- columns from the input table
    * \`type\` -- \`ATTR\` for an attribute, \`VERB\` for a relation
    * \`name\` -- the standard form of the relation
    * \`negated\` -- \`true\` for negated relations, \`false\` otherwise
    * \`subject\` -- the subject of the relation or target of the attribute
    * \`object\` -- the object of the relation, if any
    * \`subjectUid\`-- ID of the entity
    * \`objectUid\` -- ID of the entity
    * \`subjectType\` -- when the subject is an entity, its type (e.g. \`organization\`, \`food\`)
    * \`objectType\` -- when the object is an entity, its type


* \`analysis-result-sentences\` -- sentences level results with the following columns 
    * all \`id\` -- columns from the input table
    * \`index\` -- a zero-based index of the sentence in the document
    * \`segment\` -- segment of the document - ``text``. ``title`` or ``lead``
    * \`text\` -- text of the sentence
    * \`sentimentValue\`  -- detected sentiment of the sentence (a decimal number between *-1* and *1*)
    * \`sentimentPolarity\` -- polarity of _sentimentValue_ (_1_, _0_ or _-1_)
    * \`sentimentLabel\` _sentimentValue_ expressed as a label (_positive_, _neutral_ or _negative_)

There are usually multiple rows per one document. All columns are part of the primary key.
`;

export default createReactClass({
  propTypes: {
    show: PropTypes.bool,
    onClose: PropTypes.func
  },

  render() {
    return (
      <Modal
        show={this.props.show}
        onHide={this.props.onClose}
        bsSize="large"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Analysis Result Explanation
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Markdown
            source={content}
          />
        </Modal.Body>

      </Modal>
    );
  }


});
