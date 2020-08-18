let environment = "production";
module.exports = {
    apps : [
        {
            name      : 'mrn_deposit',
            script    : 'npm',
            args: 'run mrn_deposit',
            max_memory_restart : '200M',
            env: {
                "NODE_ENV": environment,
            }
        },
        {
            name      : 'mrn_deposit_confirm',
            script    : 'npm',
            args: 'run mrn_deposit_confirm',
            max_memory_restart : '200M',
            env: {
                "NODE_ENV": environment,
            }
        },
        {
            name      : 'mrn_withdrawal',
            script    : 'npm',
            args: 'run mrn_withdrawal',
            max_memory_restart : '200M',
            env: {
                "NODE_ENV": environment,
            }
        },
        {
            name      : 'fake_data',
            script    : 'npm',
            args: 'run fake_data',
            max_memory_restart : '200M',
            env: {
                "NODE_ENV": environment,
            }
        },
    ]
};
