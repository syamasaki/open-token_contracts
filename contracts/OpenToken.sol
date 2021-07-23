// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract OpenToken is ERC721Enumerable, ERC721Burnable, ERC721URIStorage, Ownable {

    // Mapping from token ID to tokenCreator address
    mapping(uint256 => address) private _tokenCreators;

    constructor() ERC721('Open Token', 'OT') Ownable() {
    }

    function mintAndSetTokenURI(address to, uint256 tokenId, string memory _tokenURI) public onlyOwner {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        _setTokenCreator(tokenId, to);
    }

    function tokenURI(uint256 tokenId) public view virtual override(ERC721URIStorage, ERC721) returns (string memory){
        return super.tokenURI(tokenId);
    }

    function tokenCreator(uint256 tokenId) public view returns (address) {
        require(_exists(tokenId), "OceanItemToken: tokenCreator query for nonexistent token");
        return _tokenCreators[tokenId];
    }

    function burn(uint256 tokenId) public override(ERC721Burnable) {
        super.burn(tokenId);
    }

    function _setTokenCreator(uint256 tokenId, address _tokenCreator) internal {
        require(_exists(tokenId), "OceanItemToken: tokenCreator set of nonexistent token");
        _tokenCreators[tokenId] = _tokenCreator;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Enumerable, ERC721) returns (bool){
        return super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721Enumerable, ERC721) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal virtual override(ERC721URIStorage, ERC721) {
        super._burn(tokenId);
        if (_tokenCreators[tokenId] != address(0)) {
            delete _tokenCreators[tokenId];
        }
    }
}