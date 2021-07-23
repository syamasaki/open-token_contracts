const OpenToken = artifacts.require('OpenToken');

contract('OpenToken: Just After Minting', async (accounts) => {

    it('owner can call mintAndSetTokenURI()', async () => {
        const TokenContract = await OpenToken.deployed();
        assert(TokenContract, 'contract failed to deploy');

        const response = await TokenContract.mintAndSetTokenURI(
            accounts[1], 
            1, // tokenId
            'https://example.com/tokens/1',
            { from: accounts[0] }
        );
        assert(response.receipt.status, 'failed to mint with accounts[0]');
    });

    it('non owner can not call mintAndSetTokenURI()', async() => {
        const TokenContract = await OpenToken.deployed();
        try {
            const response = await TokenContract.mintAndSetTokenURI(
                accounts[1],
                2,
                'https://example.com/tokens/2',
                { from: accounts[1] }
            );    
        } catch (e) {
            assert(e.reason == 'Ownable: caller is not the owner', 'unexpected reason failed')
        }
    });

    it('minted token\'s configured values check', async() => {
        const TokenContract = await OpenToken.deployed();

        let tokenURI = await TokenContract.tokenURI(1);
        assert(tokenURI == 'https://example.com/tokens/1', 'unexpected token uri');

        let tokenCreator = await TokenContract.tokenCreator(1);
        assert(tokenCreator == accounts[1], 'unexpected token creator configured');
    });

    it('only approved account can burn the token', async() => {
        const TokenContract = await OpenToken.deployed();

        // even contract owner can not burn the token
        try {
            let response = await TokenContract.burn(1, {from: accounts[0]});
        } catch (e) {
            assert(e.reason == 'ERC721Burnable: caller is not owner nor approved', 'unexpected reason failed')
        }
        
        // if unauthorized account tried to burn
        try {
            let response = await TokenContract.burn(1, {from: accounts[4]});
        } catch (e) {
            assert(e.reason == 'ERC721Burnable: caller is not owner nor approved', 'unexpected reason failed')
        }

        // token owner can burn
        response = await TokenContract.burn(1, {from: accounts[1]});
        assert(response.receipt.status, 'failed to burn with owner(accounts[1])');

        // approved account can burn
        response = await TokenContract.mintAndSetTokenURI(
            accounts[1], 
            1, // tokenId
            'https://example.com/tokens/1',
            { from: accounts[0] }
        );
        await TokenContract.approve(accounts[2], 1, {from: accounts[1]});
        response = await TokenContract.burn(1, {from: accounts[2]});
        assert(response.receipt.status, 'failed to burn with approvedAccount(accounts[2])');

        // approvedForAll account can burn
        response = await TokenContract.mintAndSetTokenURI(
            accounts[1], 
            1, // tokenId
            'https://example.com/tokens/1',
            { from: accounts[0] }
        );
        await TokenContract.setApprovalForAll(accounts[3], true, {from: accounts[1]});
        response = await TokenContract.burn(1, {from: accounts[3]});
        assert(response.receipt.status, 'failed to burn with approvedForAllAccount(accounts[3])');
    });
});

contract('OpenToken: After First Transfer', async(accounts) => {

    it('minting first token', async () => {
        const TokenContract = await OpenToken.deployed();
        assert(TokenContract, 'contract failed to deploy');

        const response = await TokenContract.mintAndSetTokenURI(
            accounts[1], 
            1, // tokenId
            'https://example.com/tokens/1',
            { from: accounts[0] }
        );
        assert(response.receipt.status, 'failed to mint with accounts[0]');
    });

    it('only authorized accounts can transfer token', async() => {
        const TokenContract = await OpenToken.deployed();

        // even contract owner can not transfer token
        try {
            response = await TokenContract.transferFrom(
                accounts[1],
                accounts[2],
                1,
                { from: accounts[0] }
            );    
        } catch (e) {
            assert(e.reason == 'ERC721: transfer caller is not owner nor approved')
        }

        // token owner(accounts[1])が、tokenをaccountB(accounts[2])にtransferできる
        response = await TokenContract.transferFrom(
            accounts[1],
            accounts[2],
            1,
            { from: accounts[1] }
        );
        assert(response.receipt.status, 'failed to transfer token to accounts[2]');

        // token owner(accounts[2])が、tokenをaccountA(accounts[1])に戻す
        response = await TokenContract.transferFrom(
            accounts[2],
            accounts[1],
            1,
            { from: accounts[2] }
        );
        assert(response.receipt.status, 'failed to transfer token to accounts[2]');

        // accounts2は、tokenをtransferできない
        try {
            response = await TokenContract.transferFrom(
                accounts[1],
                accounts[2],
                1,
                { from: accounts[2] }
            );
        } catch(e) {
            assert(e.reason == 'ERC721: transfer caller is not owner nor approved')
        }

        await TokenContract.approve(accounts[0], 1, {from: accounts[1]});
        response = await TokenContract.transferFrom(
            accounts[1],
            accounts[2],
            1,
            { from: accounts[0] }
        );
        assert(response.receipt.status, 'failed to transfer by approved accounts(accounts[0])');

        await TokenContract.setApprovalForAll(accounts[0], true, {from: accounts[2]});
        response = await TokenContract.transferFrom(
            accounts[2],
            accounts[1],
            1,
            { from: accounts[0] }
        );
        assert(response.receipt.status, 'failed to transfer by approved accounts(accounts[0])');
    });

    it('transfered token\'s configured values check', async() => {
        const TokenContract = await OpenToken.deployed();
        let tokenURI = await TokenContract.tokenURI(1);
        let tokenCreator = await TokenContract.tokenCreator(1);

        assert(tokenURI == 'https://example.com/tokens/1', 'unexpected token uri');
        assert(tokenCreator == accounts[1], 'unexpected token creator');
    });

    it('only authorized accounts can burn the token', async() => {
        const TokenContract = await OpenToken.deployed();

        try {
            response = await TokenContract.burn(1, {from: accounts[2]});
        } catch(e) {
            assert(e.reason == 'ERC721Burnable: caller is not owner nor approved');
        }

        let response = await TokenContract.burn(1, {from: accounts[1]});
        assert(response.receipt.status, 'failed to transfer by approved accounts(accounts[0])');
    });
});

contract('OpenToken: After Two Transfers', async(accounts) => {

    it('minting and transfers', async () => {
        const TokenContract = await OpenToken.deployed();
        assert(TokenContract, 'contract failed to deploy');

        let response = await TokenContract.mintAndSetTokenURI(
            accounts[1], 
            1, // tokenId
            'https://example.com/tokens/1',
            { from: accounts[0] }
        );
        assert(response.receipt.status, 'failed to mint with accounts[0]');

        response = await TokenContract.transferFrom(
            accounts[1],
            accounts[2],
            1,
            {from: accounts[1]}
        );
        assert(response.receipt.status, 'failed to transfer to accounts[2]');

        response = await TokenContract.transferFrom(
            accounts[2],
            accounts[3],
            1,
            {from: accounts[2]}
        );
        assert(response.receipt.status, 'failed to transfer to accounts[3]');
    });

    it('transfered token\'s configured values check', async() => {
        const TokenContract = await OpenToken.deployed();
        let tokenURI = await TokenContract.tokenURI(1);
        let tokenCreator = await TokenContract.tokenCreator(1);

        assert(tokenURI == 'https://example.com/tokens/1', 'unexpected token uri');
        assert(tokenCreator == accounts[1], 'unexpected token creator');
    });

    // tokenは、今accounts[3]が持っている
    it('only authorized accounts can transfer token', async() => {
        const TokenContract = await OpenToken.deployed();

        // even contract owner can not transfer token
        try {
            response = await TokenContract.transferFrom(
                accounts[3],
                accounts[2],
                1,
                { from: accounts[0] }
            );    
        } catch (e) {
            assert(e.reason == 'ERC721: transfer caller is not owner nor approved')
        }

        // token owner(accounts[3])が、tokenをaccountB(accounts[4])にtransferできる
        response = await TokenContract.transferFrom(
            accounts[3],
            accounts[4],
            1,
            { from: accounts[3] }
        );
        assert(response.receipt.status, 'failed to transfer token to accounts[4]');

        response = await TokenContract.approve(accounts[0], 1, {from: accounts[4]});
        response = await TokenContract.transferFrom(
            accounts[4],
            accounts[3],
            1,
            { from: accounts[0] }
        );
        assert(response.receipt.status, 'failed to transfer token to accounts[3] by approvedAccount(accounts[0])');

        response = await TokenContract.setApprovalForAll(accounts[0], true, {from: accounts[3]});
        response = await TokenContract.transferFrom(
            accounts[3],
            accounts[2],
            1,
            { from: accounts[0] }
        );
        assert(response.receipt.status, 'failed to transfer token to accounts[2] by approvedForAllAccount(accounts[0])');
    });

    it('only authorized accounts can burn the token', async() => {
        const TokenContract = await OpenToken.deployed();
        try {
            let response = await TokenContract.burn(1, {from: accounts[3]});
        } catch (e) {
            assert(e.reason == 'ERC721Burnable: caller is not owner nor approved')
        }

        response = await TokenContract.approve(accounts[0], 1, {from: accounts[2]});
        response = await TokenContract.burn(1, {from: accounts[0]});
        assert(response.receipt.status, 'failed to burn token by approvedAccount(accounts[0])');
    });
});