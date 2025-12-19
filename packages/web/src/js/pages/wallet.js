// Wallet Page - Deposits, Withdrawals, Balance
function renderWallet(container, api) {
  var user = api.user;
  if (!user) {
    container.innerHTML = '<section><h2>Please Login</h2><p>You need to be logged in to access your wallet.</p></section>';
    return;
  }
  
  var html = 
    '<section>' +
      '<h2>My Wallet</h2>' +
      '<p style="color: var(--text-muted); margin-bottom: 2rem;">Manage your funds for investments</p>' +
      
      // Balance Cards
      '<div class="card-grid" id="wallet-balance" style="margin-bottom: 2rem;">' +
        '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;">Loading balance...</div>' +
      '</div>' +
      
      // Action Buttons
      '<div style="display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;">' +
        '<button class="btn btn-primary" id="deposit-btn">+ Deposit Funds</button>' +
        '<button class="btn btn-outline" id="withdraw-btn">Withdraw</button>' +
      '</div>' +
      
      // Transactions
      '<h3 style="margin-bottom: 1rem;">Recent Transactions</h3>' +
      '<div id="transactions-list">' +
        '<div style="text-align: center; padding: 2rem;">Loading transactions...</div>' +
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
        '<div class="card" style="padding: 1.5rem; text-align: center;">' +
          '<div style="font-size: 2.5rem; font-weight: bold; color: var(--secondary-color);">GH₵' + data.balance.toLocaleString() + '</div>' +
          '<div style="color: var(--text-muted);">Available Balance</div>' +
        '</div>' +
        '<div class="card" style="padding: 1.5rem; text-align: center;">' +
          '<div style="font-size: 2rem; font-weight: bold; color: var(--primary-color);">GH₵' + data.totalInvested.toLocaleString() + '</div>' +
          '<div style="color: var(--text-muted);">Total Invested</div>' +
        '</div>' +
        '<div class="card" style="padding: 1.5rem; text-align: center;">' +
          '<div style="font-size: 2rem; font-weight: bold; color: var(--accent-color);">GH₵' + data.totalEarnings.toLocaleString() + '</div>' +
          '<div style="color: var(--text-muted);">Total Earnings</div>' +
        '</div>';
    })
    .catch(function(err) {
      balanceContainer.innerHTML = 
        '<div class="card" style="padding: 1.5rem; text-align: center;">' +
          '<div style="font-size: 2.5rem; font-weight: bold; color: var(--secondary-color);">GH₵0</div>' +
          '<div style="color: var(--text-muted);">Available Balance</div>' +
        '</div>' +
        '<div class="card" style="padding: 1.5rem; text-align: center;">' +
          '<div style="font-size: 2rem; font-weight: bold; color: var(--primary-color);">GH₵0</div>' +
          '<div style="color: var(--text-muted);">Total Invested</div>' +
        '</div>' +
        '<div class="card" style="padding: 1.5rem; text-align: center;">' +
          '<div style="font-size: 2rem; font-weight: bold; color: var(--accent-color);">GH₵0</div>' +
          '<div style="color: var(--text-muted);">Total Earnings</div>' +
        '</div>';
    });
}

function loadTransactions(api) {
  var listContainer = document.getElementById('transactions-list');
  
  api.getTransactions({ limit: 10 })
    .then(function(data) {
      if (!data.transactions || data.transactions.length === 0) {
        listContainer.innerHTML = '<div class="card" style="padding: 2rem; text-align: center;">No transactions yet</div>';
        return;
      }
      
      listContainer.innerHTML = data.transactions.map(function(tx) {
        var isCredit = tx.amount > 0;
        var typeLabel = {
          'deposit': 'Deposit',
          'withdrawal': 'Withdrawal',
          'investment': 'Investment',
          'profit': 'Profit'
        }[tx.type] || tx.type;
        
        var statusColor = {
          'success': 'var(--secondary-color)',
          'pending': '#f59e0b',
          'pending_approval': '#f59e0b',
          'failed': '#ef4444'
        }[tx.status] || '#6b7280';
        
        return '<div class="card" style="padding: 1rem; margin-bottom: 0.5rem;">' +
          '<div style="display: flex; justify-content: space-between; align-items: center;">' +
            '<div>' +
              '<div style="font-weight: 500;">' + typeLabel + '</div>' +
              '<div style="font-size: 0.875rem; color: var(--text-muted);">' + tx.description + '</div>' +
              '<div style="font-size: 0.75rem; color: var(--text-muted);">' + new Date(tx.createdAt).toLocaleString() + '</div>' +
            '</div>' +
            '<div style="text-align: right;">' +
              '<div style="font-size: 1.25rem; font-weight: bold; color: ' + (isCredit ? 'var(--secondary-color)' : '#ef4444') + ';">' +
                (isCredit ? '+' : '') + 'GH₵' + Math.abs(tx.amount).toLocaleString() +
              '</div>' +
              '<span class="badge" style="background: ' + statusColor + ';">' + tx.status + '</span>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    })
    .catch(function(err) {
      listContainer.innerHTML = '<div class="card" style="padding: 2rem; text-align: center; color: #ef4444;">Error loading transactions</div>';
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
          '<input type="number" id="deposit-amount" min="100" step="0.01" required placeholder="Enter amount (min 100)">' +
        '</div>' +
        '<div class="form-actions">' +
          '<button type="button" class="btn btn-outline close-modal">Cancel</button>' +
          '<button type="submit" class="btn btn-primary">Continue to Payment</button>' +
        '</div>' +
      '</form>' +
    '</div>';
  
  document.body.appendChild(modal);
  
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
      '<p style="color: var(--text-muted); margin-bottom: 1.5rem;">Withdraw to your bank account</p>' +
      '<form id="withdraw-form">' +
        '<div class="form-group">' +
          '<label for="withdraw-amount">Amount (GH₵)</label>' +
          '<input type="number" id="withdraw-amount" min="100" step="0.01" required placeholder="Enter amount (min 100)">' +
        '</div>' +
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
        '<div class="form-actions">' +
          '<button type="button" class="btn btn-outline close-modal">Cancel</button>' +
          '<button type="submit" class="btn btn-primary">Submit Withdrawal</button>' +
        '</div>' +
      '</form>' +
    '</div>';
  
  document.body.appendChild(modal);
  
  // Load banks
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
  
  // Verify account on blur
  var accountInput = document.getElementById('account-number');
  var bankSelect = document.getElementById('bank-code');
  var accountName = document.getElementById('account-name');
  
  function verifyAccount() {
    var accNum = accountInput.value;
    var bankCode = bankSelect.value;
    
    if (accNum && bankCode && accNum.length >= 10) {
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
  
  modal.querySelector('#withdraw-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    
    var data = {
      amount: parseFloat(document.getElementById('withdraw-amount').value),
      bankCode: document.getElementById('bank-code').value,
      accountNumber: document.getElementById('account-number').value,
      accountName: document.getElementById('account-name').value
    };
    
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
