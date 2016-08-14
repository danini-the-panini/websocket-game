import React from 'react';
import { connect } from 'react-redux';

import {
  onKeyDown, onKeyUp
} from '../clientActionCreators';

export default class KeyboardListener extends React.Component {
  static propTypes = {
    onKeyDown: React.PropTypes.func.isRequired,
    onKeyUp: React.PropTypes.func.isRequired
  }

  onKeyDown = (event) => {
    this.props.onKeyDown(event);
    event.preventDefault();
  }

  onKeyUp = (event) => {
    this.props.onKeyUp(event);
    event.preventDefault();
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
  }

  render() {
    return null;
  }
}

KeyboardListener.Connected = connect(
  () => ({}),
  { onKeyDown, onKeyUp }
)(KeyboardListener);
