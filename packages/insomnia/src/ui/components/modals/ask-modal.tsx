import { autoBindMethodsForReact } from 'class-autobind-decorator';
import React, { PureComponent } from 'react';

import { AUTOBIND_CFG } from '../../../common/constants';
import { type ModalHandle, Modal } from '../base/modal';
import { ModalBody } from '../base/modal-body';
import { ModalFooter } from '../base/modal-footer';
import { ModalHeader } from '../base/modal-header';

interface State {
  title: string;
  message: string;
  yesText: string;
  noText: string;
  loading: boolean;
}

interface AskModalOptions {
  title?: string;
  message?: string;
  onDone?: (success: boolean) => Promise<void>;
  yesText?: string;
  noText?: string;
}

@autoBindMethodsForReact(AUTOBIND_CFG)
export class AskModal extends PureComponent<{}, State> {
  state: State = {
    title: '',
    message: '',
    yesText: 'Yes',
    noText: 'No',
    loading: false,
  };

  modal: ModalHandle | null = null;
  yesButton: HTMLButtonElement | null = null;

  _doneCallback: AskModalOptions['onDone'];
  _promiseCallback: (value: boolean | PromiseLike<boolean>) => void = () => {};

  _setModalRef(modal: ModalHandle) {
    this.modal = modal;
  }

  _setYesButtonRef(yesButton: HTMLButtonElement) {
    this.yesButton = yesButton;
  }

  async _handleYes() {
    this.setState({
      loading: true,
    });

    // Wait for the callback to finish before closing
    await this._doneCallback?.(true);

    this._promiseCallback(true);

    this.hide();
  }

  async _handleNo() {
    this.hide();
    await this._doneCallback?.(false);

    this._promiseCallback(false);
  }

  hide() {
    this.modal?.hide();
  }

  show({ title, message, onDone, yesText, noText }: AskModalOptions = {}) {
    this._doneCallback = onDone;
    this.setState({
      title: title || 'Confirm',
      message: message || 'No message provided',
      yesText: yesText || 'Yes',
      noText: noText || 'No',
      loading: false,
    });
    this.modal?.show();

    setTimeout(() => {
      this.yesButton?.focus();
    }, 100);

    return new Promise<boolean>(resolve => {
      this._promiseCallback = resolve;
    });
  }

  render() {
    const { message, title, yesText, noText, loading } = this.state;
    return (
      <Modal noEscape ref={this._setModalRef}>
        <ModalHeader>{title || 'Confirm?'}</ModalHeader>
        <ModalBody className="wide pad">{message}</ModalBody>
        <ModalFooter>
          <div>
            <button className="btn" onClick={this._handleNo}>
              {noText}
            </button>
            <button
              ref={this._setYesButtonRef}
              className="btn"
              onClick={this._handleYes}
              disabled={loading}
            >
              {loading && <i className="fa fa-refresh fa-spin" />} {yesText}
            </button>
          </div>
        </ModalFooter>
      </Modal>
    );
  }
}
