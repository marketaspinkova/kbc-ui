import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import Markdown from '../../../react/common/Markdown';

const content = `
The result contains two tables:

* \`analysis-result-documents\` with document-level results in the following columns:
    * all \`id\` columns from the input table (used as primary keys)
    * \`language\` detected language of the document, as ISO 639-1 language code
    * \`sentimentPolarity\` detected sentiment of the document (_1_, _0_ or _-1_)
    * \`sentimentLabel\` sentiment of the document as a label (_positive_, _neutral_ or _negative_)
    * \`usedChars\` the number of characters used by this document


* \`analysis-result-entities\` with entity-level results has the following columns:
    * all \`id\` columns from the input table
    * \`type\` type of the found entity, e.g. _person_, _organization_ or _tag_
    * \`text\` disambiguated and standardized form of the entity, e.g. _John Smith_, _Keboola_, _safe carseat_


* \`analysis-result-relations\` table contains relations and attributes found in the text. For example, _good_ in _a good pizza_ or _the pizza is good_ is an attribute of _pizza_, while _eat_ in _John ate a pizza_ is a relation between _John_ and _pizza_. The table has the following columns:

   * type -- \`ATTR\` for an attribute, \`VERB\` for a relation
   * name -- the standard form of the relation
   * negated -- \`true\` for negated relations, \`false\` otherwise
   * subject -- the subject of the relation or target of the attribute
   * object -- the object of the relation, if any
   * subjectType -- when the subject is an entity, its type (e.g. \`organization\`, \`food\`)
   * objectType -- when the object is an entity, its type

   For _I ordered a good pizza._, the table will contain the following rows

   type | name  | negated | subject | object | subjectType | objectType |
   ---- | ----- | ------- | ------- | ------ | ----------- | ---------- |
   VERB | order | false   | I       | pizza  |             | food       |
   ATTR | good  | false   | pizza   |        | food        |            |

There are multiple rows per one document. All columns are part of the primary key.
  Note that the table also contains topic tags, marked as _tag_ in the type field.
`;

export default React.createClass({
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
