// Wallet Page - Deposits, Withdrawals, Balance
function renderWallet(container, api) {
  var user = api.user;
  if (!user) {
    container.innerHTML = 
      '<section>' +
        '<div class="page-header">' +
          '<h1>Wallet</h1>' +
          '<p>Manage your funds</p>' +
        '</div>' +
        '<div class="card" style="text-align: center; padding: 2rem;">' +
          '<p style="margin-bottom: 1rem;">Please login to access your wallet</p>' +
          '<button class="btn btn-primary" onclick="document.getElementById(\'login-btn\').click()">Login</button>' +
        '</div>' +
      '</section>';
    return;
  }
  
  var html = 
    '<section>' +
      '<div class="page-header">' +
        '<h1>Wallet</h1>' +
        '<p>Manage your funds</p>' +
      '</div>' +
      
      // Balance Cards - Stats Grid like mobile
      '<div class="stats-grid" id="wallet-balance">' +
        '<div class="card stat-card">' +
          '<div class="value" style="color: var(--secondary-color) !important;">Loading...</div>' +
          '<div class="label">Available Balance</div>' +
        '</div>' +
      '</div>' +
      
      // Action Buttons - Like mobile app
      '<div class="action-buttons" style="display: flex; gap: 0.75rem; margin: 1.5rem 0;">' +
        '<button class="btn btn-primary" id="deposit-btn" style="flex: 1;">+ Deposit</button>' +
        '<button class="btn btn-outline" id="withdraw-btn" style="flex: 1;">Withdraw</button>' +
      '</div>' +
      
      // Transactions Card
      '<div class="card">' +
        '<h3>Recent Transactions</h3>' +
        '<div id="transactions-list">' +
          '<div style="text-align: center; padding: 1rem; color: var(--text-muted);">Loading...</div>' +
        '</div>' +
      '</div>' +
    '</section>';
  
  container.innerHTML = html;
  
  // Load wallet data
  loadWalletBalance(api);
  loadTransactions(api);
  
  // Check for payment callback
  var urlParams = new URLSearchParams(window.location.search);
  var status = urlParams.get('status');
  var reference = urlParams.get('reference') || urlParams.get('trxref');
  
  if (status === 'success' && reference) {
    verifyPayment(api, reference);
  }
  
  // Deposit button
  document.getElementById('deposit-btn').addEventListener('click', function() {
    showDepositModal(api);
  });
  
  // Withdraw button
  document.getElementById('withdraw-btn').addEventListener('click', function() {
    showWithdrawModal(api);
  });
}

function loadWalletBalance(api) {
  var balanceContainer = document.getElementById('wallet-balance');
  
  api.getWalletBalance()
    .then(function(data) {
      balanceContainer.innerHTML = 
        '<div class="card stat-card">' +
          '<div class="value" style="color: var(--secondary-color) !important;">GH₵' + data.balance.toLocaleString() + '</div>' +
          '<div class="label">Available Balance</div>' +
        '</div>' +
        '<div class="card stat-card">' +
          '<div class="value" style="color: var(--primary-color) !important;">GH₵' + data.totalInvested.toLocaleString() + '</div>' +
          '<div class="label">Total Invested</div>' +
        '</div>' +
        '<div class="card stat-card">' +
          '<div class="value" style="color: #f59e0b !important;">GH₵' + data.totalEarnings.toLocaleString() + '</div>' +
          '<div class="label">Total Earnings</div>' +
        '</div>';
    })
    .catch(function(err) {
      balanceContainer.innerHTML = 
        '<div class="card stat-card">' +
          '<div class="value" style="color: var(--secondary-color) !important;">GH₵0</div>' +
          '<div class="label">Available Balance</div>' +
        '</div>' +
        '<div class="card stat-card">' +
          '<div class="value" style="color: var(--primary-color) !important;">GH₵0</div>' +
          '<div class="label">Total Invested</div>' +
        '</div>' +
        '<div class="card stat-card">' +
          '<div class="value" style="color: #f59e0b !important;">GH₵0</div>' +
          '<div class="label">Total Earnings</div>' +
        '</div>';
    });
}

function loadTransactions(api) {
  var listContainer = document.getElementById('transactions-list');
  
  api.getTransactions({ limit: 10 })
    .then(function(data) {
      if (!data.transactions || data.transactions.length === 0) {
        listContainer.innerHTML = '<div style="text-align: center; padding: 1.5rem; color: var(--text-muted);">No transactions yet</div>';
        return;
      }
      
      listContainer.innerHTML = data.transactions.map(function(tx) {
        var isCredit = tx.type === 'deposit' || tx.type === 'profit';
        var icon = { 'deposit': '💰', 'withdrawal': '📤', 'investment': '📊', 'profit': '💵' }[tx.type] || '💳';
        var typeLabel = tx.type.toUpperCase();
        var statusClass = tx.status === 'success' ? 'success' : (tx.status.includes('pending') ? 'pending' : '');
        
        return '<div class="transaction-item">' +
          '<div class="tx-left">' +
            '<div class="tx-icon">' + icon + '</div>' +
            '<div class="tx-info">' +
              '<div class="tx-type">' + typeLabel + '</div>' +
              '<div class="tx-date">' + new Date(tx.createdAt).toLocaleDateString() + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="tx-right">' +
            '<div class="tx-amount ' + (isCredit ? 'credit' : 'debit') + '">' +
              (isCredit ? '+' : '') + 'GH₵' + Math.abs(tx.amount).toLocaleString() +
            '</div>' +
            '<div class="tx-status ' + statusClass + '">' + tx.status.replace('_', ' ') + '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    })
    .catch(function(err) {
      listContainer.innerHTML = '<div style="text-align: center; padding: 1.5rem; color: #ef4444;">Error loading transactions</div>';
    });
}

function showDepositModal(api) {
  var modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = 
    '<div class="modal-content">' +
      '<h2>Deposit Funds</h2>' +
      '<p style="color: var(--text-muted); margin-bottom: 1.5rem;">Add money to your wallet via Paystack</p>' +
      '<form id="deposit-form">' +
        '<div class="form-group">' +
          '<label for="deposit-amount">Amount (GH₵)</label>' +
          '<div style="display:flex; align-items:center; gap:0.5rem;">' +
            '<span id="deposit-currency" style="padding: 0.65rem 0.9rem; border: 1px solid var(--border-color); border-radius: 0.5rem; background: var(--surface-color); cursor: pointer; user-select: none;">GH₵</span>' +
            '<input type="number" id="deposit-amount" min="100" step="0.01" required placeholder="Enter amount (min 100)" style="flex:1;">' +
          '</div>' +
        '</div>' +
        '<div class="form-actions">' +
          '<button type="button" class="btn btn-outline close-modal">Cancel</button>' +
          '<button type="submit" class="btn btn-primary">Continue to Payment</button>' +
        '</div>' +
      '</form>' +
    '</div>';
  
  document.body.appendChild(modal);
  var depositAmountInput = modal.querySelector('#deposit-amount');
  var depositCurrency = modal.querySelector('#deposit-currency');
  if (depositCurrency) {
    depositCurrency.addEventListener('click', function() { depositAmountInput.focus(); });
  }
  
  modal.querySelector('.close-modal').addEventListener('click', function() {
    modal.remove();
  });
  
  modal.addEventListener('click', function(e) {
    if (e.target === modal) modal.remove();
  });
  
  modal.querySelector('#deposit-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var amount = parseFloat(document.getElementById('deposit-amount').value);
    var submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Initializing...';
    
    api.initializeDeposit(amount)
      .then(function(result) {
        // Redirect to Paystack
        window.location.href = result.authorization_url;
      })
      .catch(function(err) {
        alert('Error: ' + err.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Continue to Payment';
      });
  });
}

function showWithdrawModal(api) {
  var modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = 
    '<div class="modal-content" style="max-width: 500px;">' +
      '<h2>Withdraw Funds</h2>' +
      '<p style="color: var(--text-muted); margin-bottom: 1.5rem;">Withdraw to your bank account or mobile money</p>' +
      '<form id="withdraw-form">' +
        '<div class="form-group">' +
          '<label for="withdraw-method">Payout Method</label>' +
          '<div id="withdraw-method" style="display: flex; gap: 0.75rem;">' +
            '<button type="button" class="btn btn-outline method-btn active" data-method="bank" style="flex:1">Bank</button>' +
            '<button type="button" class="btn btn-outline method-btn" data-method="momo" style="flex:1">MoMo</button>' +
          '</div>' +
        '</div>' +
        '<div class="form-group">' +
          '<label for="withdraw-amount">Amount (GH₵)</label>' +
          '<div style="display:flex; align-items:center; gap:0.5rem;">' +
            '<span id="withdraw-currency" style="padding: 0.65rem 0.9rem; border: 1px solid var(--border-color); border-radius: 0.5rem; background: var(--surface-color); cursor: pointer; user-select: none;">GH₵</span>' +
            '<input type="number" id="withdraw-amount" min="100" step="0.01" required placeholder="Enter amount (min 100)" style="flex:1;">' +
          '</div>' +
        '</div>' +
        '<div id="bank-fields">' +
          '<div class="form-group">' +
            '<label for="bank-code">Bank</label>' +
            '<select id="bank-code" required style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem; background: var(--background-color); color: var(--text-color);">' +
              '<option value="">Loading banks...</option>' +
            '</select>' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="account-number">Account Number</label>' +
            '<input type="text" id="account-number" required placeholder="Enter account number">' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="account-name">Account Name</label>' +
            '<input type="text" id="account-name" required placeholder="Account holder name" readonly style="background: var(--surface-color);">' +
          '</div>' +
        '</div>' +

        '<div id="momo-fields" style="display:none">' +
          '<div class="form-group">' +
            '<label for="momo-network">MoMo Network</label>' +
            '<select id="momo-network" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem; background: var(--background-color); color: var(--text-color);">' +
              '<option value="">Select network</option>' +
              '<option value="MTN">MTN MoMo</option>' +
              '<option value="Vodafone">Vodafone Cash</option>' +
              '<option value="AirtelTigo">AirtelTigo Money</option>' +
            '</select>' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="momo-number">MoMo Number</label>' +
            '<input type="tel" id="momo-number" placeholder="e.g. 0244 123 456" pattern="[0-9]{10}" inputmode="numeric">' +
          '</div>' +
          '<p style="color: var(--text-muted); font-size: 0.85rem; margin-top: -0.5rem;">Ensure this number is registered for mobile money.</p>' +
        '</div>' +
        '<div class="form-actions">' +
          '<button type="button" class="btn btn-outline close-modal">Cancel</button>' +
          '<button type="submit" class="btn btn-primary">Submit Withdrawal</button>' +
        '</div>' +
      '</form>' +
    '</div>';
  
  document.body.appendChild(modal);
  
  // Method toggle
  var methodButtons = Array.prototype.slice.call(modal.querySelectorAll('.method-btn'));
  var bankFields = document.getElementById('bank-fields');
  var momoFields = document.getElementById('momo-fields');
  var selectedMethod = 'bank';
  methodButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      methodButtons.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      selectedMethod = btn.getAttribute('data-method');
      bankFields.style.display = selectedMethod === 'bank' ? 'block' : 'none';
      momoFields.style.display = selectedMethod === 'momo' ? 'block' : 'none';
      document.getElementById('bank-code').required = selectedMethod === 'bank';
      document.getElementById('account-number').required = selectedMethod === 'bank';
      document.getElementById('account-name').required = selectedMethod === 'bank';
      document.getElementById('momo-network').required = selectedMethod === 'momo';
      document.getElementById('momo-number').required = selectedMethod === 'momo';
    });
  });
  
  // Load banks (only needed once)
  api.getBanks()
    .then(function(result) {
      var select = document.getElementById('bank-code');
      select.innerHTML = '<option value="">Select bank</option>' +
        result.banks.map(function(bank) {
          return '<option value="' + bank.code + '">' + bank.name + '</option>';
        }).join('');
    })
    .catch(function() {
      document.getElementById('bank-code').innerHTML = '<option value="">Could not load banks</option>';
    });
  
  // Verify account on blur (bank only)
  var accountInput = document.getElementById('account-number');
  var bankSelect = document.getElementById('bank-code');
  var accountName = document.getElementById('account-name');
  
  function verifyAccount() {
    var accNum = accountInput.value;
    var bankCode = bankSelect.value;
    
    if (selectedMethod === 'bank' && accNum && bankCode && accNum.length >= 10) {
      accountName.value = 'Verifying...';
      api.verifyBankAccount(accNum, bankCode)
        .then(function(result) {
          accountName.value = result.accountName;
        })
        .catch(function() {
          accountName.value = 'Could not verify - enter manually';
          accountName.readOnly = false;
        });
    }
  }
  
  accountInput.addEventListener('blur', verifyAccount);
  bankSelect.addEventListener('change', verifyAccount);
  
  modal.querySelector('.close-modal').addEventListener('click', function() {
    modal.remove();
  });
  
  modal.addEventListener('click', function(e) {
    if (e.target === modal) modal.remove();
  });
  
  var withdrawAmountInput = document.getElementById('withdraw-amount');
  var withdrawCurrency = document.getElementById('withdraw-currency');
  if (withdrawCurrency) {
    withdrawCurrency.addEventListener('click', function() { withdrawAmountInput.focus(); });
  }
  
  modal.querySelector('#withdraw-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    
    var data = {
      amount: parseFloat(document.getElementById('withdraw-amount').value),
      method: selectedMethod
    };
    
    if (selectedMethod === 'bank') {
      data.bankCode = document.getElementById('bank-code').value;
      data.accountNumber = document.getElementById('account-number').value;
      data.accountName = document.getElementById('account-name').value;
    } else {
      data.momoNetwork = document.getElementById('momo-network').value;
      data.momoNumber = document.getElementById('momo-number').value.replace(/\s+/g, '');
    }
    
    api.requestWithdrawal(data)
      .then(function(result) {
        alert('Withdrawal request submitted! Reference: ' + result.reference);
        modal.remove();
        loadWalletBalance(api);
        loadTransactions(api);
      })
      .catch(function(err) {
        alert('Error: ' + err.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Withdrawal';
      });
  });
}

function verifyPayment(api, reference) {
  api.verifyDeposit(reference)
    .then(function(result) {
      if (result.status === 'success') {
        alert('Deposit of GH₵' + result.amount + ' successful!');
        loadWalletBalance(api);
        loadTransactions(api);
      }
    })
    .catch(function(err) {
      console.error('Verification error:', err);
    });
  
  // Clean URL
  window.history.replaceState({}, '', window.location.pathname + window.location.hash);
}

export { renderWallet };
