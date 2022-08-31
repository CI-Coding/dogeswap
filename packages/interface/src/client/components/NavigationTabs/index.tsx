import React from "react";
import { useTranslation } from "react-i18next";
import { Link as HistoryLink, NavLink } from "react-router-dom";
import styled from "styled-components";

import { ArrowLeft } from "react-feather";
import QuestionHelper from "../QuestionHelper";
import { RowBetween } from "../Row";

const Tabs = styled.div`
    ${({ theme }) => theme.flexRowNoWrap}
    align-items: center;
    border-radius: 3rem;
    justify-content: space-evenly;
`;

const activeClassName = "ACTIVE";

const StyledNavLink = styled(NavLink).attrs({
    activeClassName,
})`
    ${({ theme }) => theme.flexRowNoWrap}
    align-items: center;
    justify-content: center;
    height: 3rem;
    border-radius: 3rem;
    outline: none;
    cursor: pointer;
    text-decoration: none;
    color: #ffffff;
    font-size: 20px;
    flex-basis: 50%;

    &.${activeClassName} {
        border-radius: 5px;
        font-weight: 600;
        background-color: #ffffff;
        color: #000000;
    }

    :hover,
    :focus {
        color: #bc7d2c;
    }
`;

const ActiveText = styled.div`
    font-weight: 500;
    font-size: 20px;
`;

const StyledArrowLeft = styled(ArrowLeft)`
    color: ${({ theme }) => theme.text1};
`;

export function SwapPoolTabs({ active }: { active: "swap" | "pool" | "liquidity" }) {
    const { t } = useTranslation();
    return (
        <Tabs style={{ marginBottom: "20px" }}>
            <StyledNavLink id={`swap-nav-link`} to={"/swap"} isActive={() => active === "swap"}>
                {t("swap")}
            </StyledNavLink>
            <StyledNavLink id={`pool-nav-link`} to={"/pool"} isActive={() => active === "pool"}>
                {t("pool")}
            </StyledNavLink>
            {/* <StyledNavLink id={`liquidity-nav-link`} to={"/liquidity"} isActive={() => active === "liquidity"}>
                Info
            </StyledNavLink> */}
        </Tabs>
    );
}

export function FindPoolTabs() {
    return (
        <Tabs>
            <RowBetween style={{ padding: "1rem" }}>
                <HistoryLink to="/pool">
                    <StyledArrowLeft />
                </HistoryLink>
                <ActiveText>Import Pool</ActiveText>
                <QuestionHelper
                    text={"Use this tool to find pairs that don't automatically appear in the interface."}
                />
            </RowBetween>
        </Tabs>
    );
}

export function AddRemoveTabs({ adding }: { adding: boolean }) {
    return (
        <Tabs>
            <RowBetween style={{ padding: "1rem" }}>
                <HistoryLink to="/pool">
                    <StyledArrowLeft />
                </HistoryLink>
                <ActiveText>{adding ? "Add" : "Remove"} Liquidity</ActiveText>
                <QuestionHelper
                    text={
                        adding
                            ? "When you add liquidity, you are given pool tokens representing your position. These tokens automatically earn fees proportional to your share of the pool, and can be redeemed at any time."
                            : "Removing pool tokens converts your position back into underlying tokens at the current rate, proportional to your share of the pool. Accrued fees are included in the amounts you receive."
                    }
                />
            </RowBetween>
        </Tabs>
    );
}
