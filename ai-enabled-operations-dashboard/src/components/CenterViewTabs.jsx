function CenterViewTabs({ tabs, activeTab, setActiveTab }) {
  return (
    <div className="view-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`view-tabs__tab ${activeTab === tab.id ? 'is-active' : ''} accent-${tab.accent}`}
          onClick={() => setActiveTab(tab.id)}
          data-box-id={tab.id}
        >
          <span className="view-tabs__label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

export default CenterViewTabs;
