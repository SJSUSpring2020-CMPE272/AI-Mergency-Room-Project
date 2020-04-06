import React, { Component } from 'react';
import classNames from 'classnames';
import DomHandler from './DomHandler';
import UniqueComponentId from './UniqueComponentId';

export class Accordion extends Component {
  constructor(props) {
    super(props);
    if (!this.props.onTabChange) {
      this.state = {
        activeIndex: props.activeIndex,
      };
    }

    this.contentWrappers = [];
    this.id = this.props.id || UniqueComponentId();
  }

  componentDidUpdate() {
    if (this.togglingTabIndex != null && this.togglingTabIndex >= 0) {
      const expandingTabContent = this.container.children[this.togglingTabIndex].children[1];
      DomHandler.addClass(expandingTabContent, 'ui-accordion-content-wrapper-expanding');
      setTimeout(() => {
        DomHandler.removeClass(expandingTabContent, 'ui-accordion-content-wrapper-expanding');
        this.togglingTabIndex = null;
      }, 500);
    }
  }

  onTabHeaderClick(event, tab, index) {
    if (!tab.props.disabled) {
      const selected = this.isSelected(index);
      this.togglingTabIndex = selected ? null : index;
      let newActiveIndex = null;

      if (this.props.multiple) {
        let indexes = [];
        if (this.state) {
          indexes = this.state.activeIndex || [];
        } else {
          indexes = this.props.activeIndex || [];
        }
        if (selected) indexes = indexes.filter(i => i !== index);
        else indexes = [...indexes, index];

        newActiveIndex = indexes;
      } else {
        newActiveIndex = selected ? null : index;
      }

      const callback = selected ? this.props.onTabClose : this.props.onTabOpen;
      if (callback) {
        callback({ originalEvent: event, index });
      }

      if (this.props.onTabChange) {
        this.props.onTabChange({
          originalEvent: event,
          index: newActiveIndex,
        });
      } else {
        this.setState({
          activeIndex: newActiveIndex,
        });
      }
    }

    event.preventDefault();
  }

  isSelected(index) {
    const activeIndex = this.props.onTabChange ? this.props.activeIndex : this.state.activeIndex;

    return this.props.multiple ? (activeIndex && activeIndex.indexOf(index) >= 0) : activeIndex === index;
  }

  renderTabHeader(tab, selected, index) {
    const tabHeaderClass = classNames(tab.props.headerClassName, 'ui-accordion-header ui-state-default ui-corner-all', { 'ui-state-active': selected, 'ui-state-disabled': tab.props.disabled });
    const id = `${this.id}_header_${index}`;
    const ariaControls = `${this.id}_content_${index}`;

    return (
      <div className={tabHeaderClass} style={tab.props.headerStyle}>
        <a href={`#${ariaControls}`} id={id} aria-controls={ariaControls} role="tab" aria-expanded={selected} onClick={event => this.onTabHeaderClick(event, tab, index)}>
          <span className={classNames('ui-accordion-toggle-icon pi pi-fw', { 'pi-caret-right': !selected, 'pi-caret-down': selected })} />
          <span className="ui-accordion-header-text">{tab.props.header}</span>
        </a>
      </div>
    );
  }

  renderTabContent(tab, selected, index) {
    const tabContentWrapperClass = classNames(tab.props.contentClassName, 'ui-accordion-content-wrapper', {
      'ui-accordion-content-wrapper-collapsed': !selected,
      'ui-accordion-content-wrapper-expanded': selected,
    });
    const id = `${this.id}_content_${index}`;

    return (
      <div id={id} className={tabContentWrapperClass} style={tab.props.contentStyle}>
        <div className="ui-accordion-content ui-widget-content">
          {tab.props.children}
        </div>
      </div>
    );
  }

  renderTab(tab, index) {
    const selected = this.isSelected(index);
    const tabHeader = this.renderTabHeader(tab, selected, index);
    const tabContent = this.renderTabContent(tab, selected, index);

    return (
      <div key={tab.props.header} className="ui-accordion-tab">
        {tabHeader}
        {tabContent}
      </div>
    );
  }

  renderTabs() {
    return (
      React.Children.map(this.props.children, (tab, index) => this.renderTab(tab, index))
    );
  }

  render() {
    const className = classNames('ui-accordion ui-widget ui-helper-reset', this.props.className);
    const tabs = this.renderTabs();

    return (
      <div ref={el => this.container = el} id={this.id} className={className} style={this.props.style}>
        {tabs}
      </div>
    );
  }
}
