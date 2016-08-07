import React from 'react';
import ReactDOM from 'react-dom';

const HelloMessage = ({ name }) => (
  <div>Hello {name}</div>
);
HelloMessage.propTypes = {
  name: React.PropTypes.string.isRequired
};

ReactDOM.render(
  <HelloMessage name="John" />,
  document.getElementById('react-root')
);
